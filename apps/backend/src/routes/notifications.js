export default async function notificationRoutes(fastify) {

  // GET /api/notifications
  fastify.get('/api/notifications', { preHandler: [fastify.authenticate] }, async (request) => {
    const { limit = '30', offset = '0' } = request.query;
    const [notifications, total, unread] = await fastify.prisma.$transaction([
      fastify.prisma.notification.findMany({
        where:   { userId: request.currentUser.id },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.notification.count({ where: { userId: request.currentUser.id } }),
      fastify.prisma.notification.count({ where: { userId: request.currentUser.id, readAt: null } }),
    ]);
    return { notifications, total, unread };
  });

  // PATCH /api/notifications/read-all
  fastify.patch('/api/notifications/read-all', { preHandler: [fastify.authenticate] }, async (request) => {
    await fastify.prisma.notification.updateMany({
      where: { userId: request.currentUser.id, readAt: null },
      data:  { readAt: new Date() },
    });
    return { ok: true };
  });

  // PATCH /api/notifications/:id/read
  fastify.patch('/api/notifications/:id/read', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const notif = await fastify.prisma.notification.findUnique({ where: { id: request.params.id } });
    if (!notif) return reply.code(404).send({ error: 'Notificación no encontrada' });
    if (notif.userId !== request.currentUser.id) return reply.code(403).send({ error: 'No autorizado' });

    const updated = await fastify.prisma.notification.update({
      where: { id: request.params.id },
      data:  { readAt: new Date() },
    });
    return { notification: updated };
  });
}
