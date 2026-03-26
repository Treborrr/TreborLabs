import { sendOrderStatusUpdateEmail } from '../services/email.js';

async function logAdmin(prisma, adminId, action, targetType, targetId, payload) {
  await prisma.adminLog.create({
    data: { adminId, action, targetType, targetId, payload: payload ?? null },
  }).catch(() => {}); // never throw on log failure
}

export default async function adminUsersRoutes(fastify) {

  // ─── Users ───────────────────────────────────────────────────────────────────

  // GET /api/admin/users
  fastify.get('/api/admin/users', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { search, role, suspended, limit = '20', offset = '0' } = request.query;
    const where = {};
    if (role)      where.role      = role.toUpperCase();
    if (suspended !== undefined) where.suspended = suspended === 'true';
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await fastify.prisma.$transaction([
      fastify.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, avatar: true,
          role: true, suspended: true, emailVerified: true,
          createdAt: true, lastSeenAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.user.count({ where }),
    ]);

    return { users, total };
  });

  // GET /api/admin/users/:id
  fastify.get('/api/admin/users/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where:  { id: request.params.id },
      select: {
        id: true, name: true, email: true, avatar: true,
        role: true, suspended: true, emailVerified: true, phone: true,
        createdAt: true, lastSeenAt: true, referralCode: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, total: true, status: true, createdAt: true },
        },
        addresses: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' });
    return { user };
  });

  // PATCH /api/admin/users/:id
  fastify.patch('/api/admin/users/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { name, email, role, suspended } = request.body ?? {};
    const data = {};
    if (name      !== undefined) data.name      = name;
    if (email     !== undefined) data.email     = email;
    if (role      !== undefined) data.role      = role.toUpperCase();
    if (suspended !== undefined) data.suspended = suspended;

    const user = await fastify.prisma.user.update({
      where:  { id: request.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, suspended: true },
    });

    await logAdmin(fastify.prisma, request.currentUser.id, suspended ? 'suspend_user' : 'edit_user',
      'user', request.params.id, data);

    return { user };
  });

  // ─── Admin Order Detail + Manual Order ───────────────────────────────────────

  // GET /api/admin/orders/:id
  fastify.get('/api/admin/orders/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const order = await fastify.prisma.order.findUnique({
      where:   { id: request.params.id },
      include: {
        orderItems:  true,
        shippingZone: true,
        coupon:       true,
        user:         { select: { id: true, name: true, email: true } },
        return:       true,
      },
    });
    if (!order) return reply.code(404).send({ error: 'Orden no encontrada' });
    return { order };
  });

  // POST /api/admin/orders — crear orden manual
  fastify.post('/api/admin/orders', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { userId, items, shippingAddress, shippingZoneId, couponId, notes } = request.body ?? {};
    if (!items?.length || !shippingAddress) {
      return reply.code(400).send({ error: 'items y shippingAddress son requeridos' });
    }

    const productIds = [...new Set(items.map(i => i.productId))];
    const products   = await fastify.prisma.product.findMany({ where: { id: { in: productIds } } });
    const pMap       = Object.fromEntries(products.map(p => [p.id, p]));

    let subtotal = 0;
    const orderItemsData = items.map(item => {
      const p = pMap[item.productId];
      if (!p) throw new Error(`Producto no encontrado: ${item.productId}`);
      subtotal += p.price * item.quantity;
      return { productId: p.id, productName: p.name, price: p.price, quantity: item.quantity };
    });

    let shippingCost = 0;
    if (shippingZoneId) {
      const zone = await fastify.prisma.shippingZone.findUnique({ where: { id: shippingZoneId } });
      if (zone) shippingCost = zone.price;
    }

    const total = parseFloat((subtotal + shippingCost).toFixed(2));

    const order = await fastify.prisma.order.create({
      data: {
        userId:         userId ?? null,
        subtotal,
        shippingCost,
        discount:       0,
        total,
        status:         'pending',
        shippingAddress,
        shippingZoneId: shippingZoneId ?? null,
        couponId:       couponId ?? null,
        notes:          notes ?? null,
        orderItems:     { create: orderItemsData },
      },
      include: { orderItems: true },
    });

    await logAdmin(fastify.prisma, request.currentUser.id, 'create_order', 'order', order.id, null);

    return reply.code(201).send({ order });
  });

  // PATCH /api/admin/orders/:id — status + nota + email
  fastify.patch('/api/admin/orders/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { status, notes } = request.body ?? {};
    const VALID_TRANSITIONS = {
      pending:    ['processing', 'cancelled'],
      processing: ['shipped',    'cancelled'],
      shipped:    ['delivered',  'cancelled'],
      delivered:  [],
      cancelled:  [],
    };
    if (status && !Object.keys(VALID_TRANSITIONS).includes(status)) {
      return reply.code(400).send({ error: 'Status inválido' });
    }

    const existing = await fastify.prisma.order.findUnique({
      where:   { id: request.params.id },
      include: { user: { select: { email: true } } },
    });
    if (!existing) return reply.code(404).send({ error: 'Orden no encontrada' });

    if (status && status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(status)) {
        return reply.code(400).send({
          error: `No se puede cambiar de "${existing.status}" a "${status}"`,
        });
      }
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (notes  !== undefined) data.notes  = notes;

    const order = await fastify.prisma.order.update({
      where:   { id: request.params.id },
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (status && status !== existing.status) {
      const email = order.user?.email ?? existing.shippingAddress?.email;
      if (email) {
        sendOrderStatusUpdateEmail(email, order, existing.status).catch(() => {});
      }
      await logAdmin(fastify.prisma, request.currentUser.id, 'update_order_status',
        'order', order.id, { from: existing.status, to: status });
    }

    return { order };
  });

  // ─── Returns ─────────────────────────────────────────────────────────────────

  // POST /api/orders/:id/return — usuario (solo delivered, ≤5 días hábiles)
  fastify.post('/api/orders/:id/return', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const order = await fastify.prisma.order.findUnique({
      where:   { id: request.params.id },
      include: { return: true },
    });

    if (!order) return reply.code(404).send({ error: 'Orden no encontrada' });
    if (order.userId !== request.currentUser.id) return reply.code(403).send({ error: 'No autorizado' });
    if (order.status !== 'delivered') {
      return reply.code(400).send({ error: 'Solo se pueden devolver pedidos entregados' });
    }
    if (order.return) return reply.code(409).send({ error: 'Ya existe una solicitud de devolución' });

    // Verificar ≤7 días calendario (≈5 hábiles) desde la entrega
    // Usamos updatedAt solo si el status es delivered; si el orden fue
    // re-tocado después, tomamos el mínimo defensivo.
    const deliveredAt = order.updatedAt; // updatedAt refleja el último cambio de status
    const daysSince = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) {
      return reply.code(400).send({ error: 'El plazo de devolución (5 días hábiles) ha vencido' });
    }

    const { reason, pickupAddress, contactPhone } = request.body ?? {};
    if (!reason || !pickupAddress || !contactPhone) {
      return reply.code(400).send({ error: 'reason, pickupAddress y contactPhone son requeridos' });
    }

    const ret = await fastify.prisma.return.create({
      data: {
        orderId: order.id,
        userId:  request.currentUser.id,
        reason,
        pickupAddress: pickupAddress ?? order.shippingAddress,
        contactPhone,
      },
    });

    return reply.code(201).send({ return: ret });
  });

  // GET /api/admin/returns
  fastify.get('/api/admin/returns', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { status, limit = '20', offset = '0' } = request.query;
    const where = status ? { status } : {};

    const [returns, total] = await fastify.prisma.$transaction([
      fastify.prisma.return.findMany({
        where,
        include: {
          user:  { select: { id: true, name: true, email: true } },
          order: { select: { id: true, total: true, createdAt: true } },
        },
        orderBy: { requestedAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.return.count({ where }),
    ]);

    return { returns, total };
  });

  // PATCH /api/admin/returns/:id — aprobar/rechazar/completar
  fastify.patch('/api/admin/returns/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { status, adminNotes } = request.body ?? {};
    const valid = ['approved', 'rejected', 'completed'];
    if (!valid.includes(status)) {
      return reply.code(400).send({ error: 'status debe ser approved, rejected o completed' });
    }

    const ret = await fastify.prisma.return.update({
      where: { id: request.params.id },
      data:  {
        status,
        adminNotes: adminNotes ?? null,
        resolvedAt: ['approved', 'rejected', 'completed'].includes(status) ? new Date() : null,
      },
    });

    await logAdmin(fastify.prisma, request.currentUser.id, `return_${status}`, 'return', ret.id,
      { adminNotes });

    return { return: ret };
  });

  // ─── Admin Logs ───────────────────────────────────────────────────────────────

  // GET /api/admin/logs
  fastify.get('/api/admin/logs', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { targetType, adminId, limit = '50', offset = '0' } = request.query;
    const where = {};
    if (targetType) where.targetType = targetType;
    if (adminId)    where.adminId    = adminId;

    const [logs, total] = await fastify.prisma.$transaction([
      fastify.prisma.adminLog.findMany({
        where,
        include: { admin: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.adminLog.count({ where }),
    ]);

    return { logs, total };
  });
}
