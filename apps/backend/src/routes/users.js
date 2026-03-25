// Rutas de usuario: perfil y pedidos

async function userRoutes(fastify) {
  // GET /api/users/me/orders — pedidos del usuario autenticado
  fastify.get('/api/users/me/orders', { preHandler: [fastify.authenticate] }, async (request) => {
    const orders = await fastify.prisma.order.findMany({
      where: { userId: request.currentUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return { orders };
  });

  // PATCH /api/users/me — actualizar nombre/avatar
  fastify.patch(
    '/api/users/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { name, avatar } = request.body;
      const user = await fastify.prisma.user.update({
        where: { id: request.currentUser.id },
        data: { name, avatar },
        select: { id: true, email: true, name: true, avatar: true },
      });
      return { user };
    }
  );

  // POST /api/orders — crear un pedido (auth opcional)
  fastify.post('/api/orders', { preHandler: [fastify.optionalAuth] }, async (request, reply) => {
    const { items, total, address } = request.body;

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
}

export default userRoutes;
