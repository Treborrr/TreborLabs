import fp from 'fastify-plugin';

// Decorador: fastify.authenticate
// Úsalo como preHandler en rutas protegidas:
//   { preHandler: [fastify.authenticate] }
const authenticatePlugin = fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();

      // Verificar que el usuario todavía existe en la DB
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { id: true, email: true, name: true, avatar: true, role: true, suspended: true },
      });

      if (!user) {
        return reply.code(401).send({ error: 'Usuario no encontrado' });
      }
      if (user.suspended) {
        return reply.code(403).send({ error: 'Cuenta suspendida. Contacta al soporte.' });
      }

      // Actualizar lastSeenAt sin bloquear la request
      fastify.prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});

      request.currentUser = user;
    } catch (err) {
      reply.code(401).send({ error: 'No autorizado' });
    }
  });

  // Decorador opcional para rutas que no requieren auth pero aprovechan el usuario si está logueado
  fastify.decorate('optionalAuth', async (request) => {
    try {
      await request.jwtVerify();
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { id: true, email: true, name: true, avatar: true, role: true },
      });
      request.currentUser = user || null;
    } catch {
      request.currentUser = null;
    }
  });
});

export default authenticatePlugin;
