export default async function shippingRoutes(fastify) {

  // GET /api/shipping/zones — público, solo habilitadas
  fastify.get('/api/shipping/zones', async () => {
    const zones = await fastify.prisma.shippingZone.findMany({
      where: { enabled: true },
      orderBy: { price: 'asc' },
    });
    return { zones };
  });

  // POST /api/shipping/calculate — body: { region } → zona + precio
  fastify.post('/api/shipping/calculate', async (request, reply) => {
    const { region } = request.body ?? {};
    if (!region) return reply.code(400).send({ error: 'region es requerida' });

    const zone = await fastify.prisma.shippingZone.findFirst({
      where: {
        enabled: true,
        regions: { has: region },
      },
    });

    if (!zone) {
      return reply.code(404).send({ error: 'No hay cobertura de envío para esa región', region });
    }

    return { zone, shippingCost: zone.price };
  });

  // ─── Admin CRUD ──────────────────────────────────────────────────────────────

  // GET /api/admin/shipping/zones
  fastify.get('/api/admin/shipping/zones', { preHandler: [fastify.requireAdmin] }, async () => {
    const zones = await fastify.prisma.shippingZone.findMany({ orderBy: { name: 'asc' } });
    return { zones };
  });

  // POST /api/admin/shipping/zones
  fastify.post('/api/admin/shipping/zones', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { name, regions, price, enabled } = request.body ?? {};
    if (!name || !regions?.length || price === undefined) {
      return reply.code(400).send({ error: 'name, regions y price son requeridos' });
    }

    const zone = await fastify.prisma.shippingZone.create({
      data: { name, regions, price: parseFloat(price), enabled: enabled ?? true },
    });
    return reply.code(201).send({ zone });
  });

  // PATCH /api/admin/shipping/zones/:id
  fastify.patch('/api/admin/shipping/zones/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const { name, regions, price, enabled } = request.body ?? {};

    const data = {};
    if (name    !== undefined) data.name    = name;
    if (regions !== undefined) data.regions = regions;
    if (price   !== undefined) data.price   = parseFloat(price);
    if (enabled !== undefined) data.enabled = enabled;

    const zone = await fastify.prisma.shippingZone.update({ where: { id }, data });
    return { zone };
  });

  // DELETE /api/admin/shipping/zones/:id
  fastify.delete('/api/admin/shipping/zones/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    await fastify.prisma.shippingZone.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
