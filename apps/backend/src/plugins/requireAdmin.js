import fp from 'fastify-plugin';

const requireAdminPlugin = fp(async (fastify) => {
  fastify.decorate('requireAdmin', async (request, reply) => {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;
    if (request.currentUser?.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Acceso denegado: se requiere rol ADMIN' });
    }
  });
});

export default requireAdminPlugin;
