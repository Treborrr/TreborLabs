async function userRoutes(fastify) {
  // ─── Perfil ───────────────────────────────────────────────────────────────

  // PATCH /api/users/me — actualizar nombre/avatar/phone
  fastify.patch('/api/users/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const { name, avatar, phone } = request.body ?? {};
    const user = await fastify.prisma.user.update({
      where: { id: request.currentUser.id },
      data: { name, avatar, phone },
      select: { id: true, email: true, name: true, avatar: true, phone: true, role: true },
    });
    return { user };
  });

  // ─── Pedidos ──────────────────────────────────────────────────────────────

  // GET /api/users/me/orders
  fastify.get('/api/users/me/orders', { preHandler: [fastify.authenticate] }, async (request) => {
    const orders = await fastify.prisma.order.findMany({
      where: { userId: request.currentUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return { orders };
  });

  // POST /api/orders — crear pedido (auth opcional, se usa hasta M2)
  fastify.post('/api/orders', { preHandler: [fastify.optionalAuth] }, async (request, reply) => {
    const { items, total, address } = request.body ?? {};
    if (!items?.length || !total) {
      return reply.code(400).send({ error: 'items y total son requeridos' });
    }
    const order = await fastify.prisma.order.create({
      data: {
        userId: request.currentUser?.id ?? null,
        items,
        total,
        address: address ?? null,
      },
    });
    return reply.code(201).send({ order });
  });

  // ─── Direcciones ──────────────────────────────────────────────────────────

  // GET /api/users/me/addresses
  fastify.get('/api/users/me/addresses', { preHandler: [fastify.authenticate] }, async (request) => {
    const addresses = await fastify.prisma.address.findMany({
      where: { userId: request.currentUser.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return { addresses };
  });

  // POST /api/users/me/addresses
  fastify.post('/api/users/me/addresses', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { label, fullName, phone, line1, line2, district, city, region, isDefault } = request.body ?? {};

    if (!label || !fullName || !phone || !line1 || !district || !city || !region) {
      return reply.code(400).send({ error: 'label, fullName, phone, line1, district, city y region son requeridos' });
    }

    const userId = request.currentUser.id;

    // Si se marca como default, quitar default de las demás
    if (isDefault) {
      await fastify.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Si no tiene ninguna dirección aún, esta será default automáticamente
    const count = await fastify.prisma.address.count({ where: { userId } });

    const address = await fastify.prisma.address.create({
      data: {
        userId,
        label,
        fullName,
        phone,
        line1,
        line2: line2 || null,
        district,
        city,
        region,
        isDefault: isDefault || count === 0,
      },
    });

    return reply.code(201).send({ address });
  });

  // PATCH /api/users/me/addresses/:id
  fastify.patch('/api/users/me/addresses/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.currentUser.id;

    const existing = await fastify.prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return reply.code(404).send({ error: 'Dirección no encontrada' });

    const { label, fullName, phone, line1, line2, district, city, region, isDefault } = request.body ?? {};

    if (isDefault) {
      await fastify.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const address = await fastify.prisma.address.update({
      where: { id },
      data: { label, fullName, phone, line1, line2, district, city, region, isDefault },
    });

    return { address };
  });

  // DELETE /api/users/me/addresses/:id
  fastify.delete('/api/users/me/addresses/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.currentUser.id;

    const existing = await fastify.prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return reply.code(404).send({ error: 'Dirección no encontrada' });

    await fastify.prisma.address.delete({ where: { id } });

    // Si era la default y quedan otras, promover la más antigua
    if (existing.isDefault) {
      const next = await fastify.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await fastify.prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return reply.code(204).send();
  });

  // PATCH /api/users/me/addresses/:id/default
  fastify.patch('/api/users/me/addresses/:id/default', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.currentUser.id;

    const existing = await fastify.prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return reply.code(404).send({ error: 'Dirección no encontrada' });

    await fastify.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const address = await fastify.prisma.address.update({ where: { id }, data: { isDefault: true } });

    return { address };
  });
}

export default userRoutes;
