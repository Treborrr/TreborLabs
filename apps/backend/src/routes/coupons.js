export default async function couponRoutes(fastify) {

  // GET /api/coupons/validate?code=XXX — valida sin consumir uso
  fastify.get('/api/coupons/validate', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const { code, orderTotal } = request.query;
    if (!code) return reply.code(400).send({ error: 'code es requerido' });

    const coupon = await fastify.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.enabled) {
      return reply.code(404).send({ valid: false, error: 'Cupón no válido' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return reply.code(400).send({ valid: false, error: 'Cupón expirado' });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return reply.code(400).send({ valid: false, error: 'Cupón agotado' });
    }
    if (coupon.minOrderTotal !== null && orderTotal !== undefined) {
      if (parseFloat(orderTotal) < coupon.minOrderTotal) {
        return reply.code(400).send({
          valid: false,
          error: `Mínimo de compra: $${coupon.minOrderTotal.toFixed(2)}`,
        });
      }
    }

    const discount = coupon.type === 'percent'
      ? (orderTotal ? parseFloat(orderTotal) * coupon.value / 100 : null)
      : coupon.value;

    return { valid: true, coupon, discount };
  });

  // ─── Admin CRUD ──────────────────────────────────────────────────────────────

  // GET /api/admin/coupons
  fastify.get('/api/admin/coupons', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { limit = '50', offset = '0' } = request.query;
    const [coupons, total] = await fastify.prisma.$transaction([
      fastify.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.coupon.count(),
    ]);
    return { coupons, total };
  });

  // POST /api/admin/coupons
  fastify.post('/api/admin/coupons', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { code, type, value, minOrderTotal, maxUses, expiresAt, enabled } = request.body ?? {};

    if (!code || !type || value === undefined) {
      return reply.code(400).send({ error: 'code, type y value son requeridos' });
    }
    if (!['percent', 'fixed'].includes(type)) {
      return reply.code(400).send({ error: 'type debe ser "percent" o "fixed"' });
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return reply.code(400).send({ error: 'value debe ser un número mayor a 0' });
    }
    if (type === 'percent' && numValue > 100) {
      return reply.code(400).send({ error: 'Un descuento en porcentaje no puede superar el 100%' });
    }
    if (maxUses !== undefined && maxUses !== null && parseInt(maxUses) < 1) {
      return reply.code(400).send({ error: 'maxUses debe ser al menos 1' });
    }
    if (minOrderTotal !== undefined && minOrderTotal !== null && parseFloat(minOrderTotal) < 0) {
      return reply.code(400).send({ error: 'minOrderTotal no puede ser negativo' });
    }

    const coupon = await fastify.prisma.coupon.create({
      data: {
        code:          code.toUpperCase().trim(),
        type,
        value:         parseFloat(value),
        minOrderTotal: minOrderTotal ? parseFloat(minOrderTotal) : null,
        maxUses:       maxUses       ? parseInt(maxUses)         : null,
        expiresAt:     expiresAt     ? new Date(expiresAt)       : null,
        enabled:       enabled ?? true,
      },
    });
    return reply.code(201).send({ coupon });
  });

  // PATCH /api/admin/coupons/:id
  fastify.patch('/api/admin/coupons/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const { code, type, value, minOrderTotal, maxUses, expiresAt, enabled } = request.body ?? {};

    const data = {};
    if (code          !== undefined) data.code          = code.toUpperCase().trim();
    if (type          !== undefined) data.type          = type;
    if (value         !== undefined) data.value         = parseFloat(value);
    if (minOrderTotal !== undefined) data.minOrderTotal = minOrderTotal ? parseFloat(minOrderTotal) : null;
    if (maxUses       !== undefined) data.maxUses       = maxUses ? parseInt(maxUses) : null;
    if (expiresAt     !== undefined) data.expiresAt     = expiresAt ? new Date(expiresAt) : null;
    if (enabled       !== undefined) data.enabled       = enabled;

    const coupon = await fastify.prisma.coupon.update({ where: { id }, data });
    return { coupon };
  });

  // DELETE /api/admin/coupons/:id
  fastify.delete('/api/admin/coupons/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    await fastify.prisma.coupon.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
