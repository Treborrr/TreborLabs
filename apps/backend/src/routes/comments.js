export default async function commentRoutes(fastify) {

  // GET /api/posts/:postId/comments — árbol top-level + replies
  fastify.get('/api/posts/:postId/comments', async (request, reply) => {
    const { postId } = request.params;
    const { limit = '30', offset = '0' } = request.query;

    const post = await fastify.prisma.post.findFirst({
      where: { OR: [{ id: postId }, { slug: postId }] },
      select: { id: true },
    });
    if (!post) return reply.code(404).send({ error: 'Post no encontrado' });

    const [comments, total] = await fastify.prisma.$transaction([
      fastify.prisma.comment.findMany({
        where:   { postId: post.id, parentId: null },
        include: {
          user:    { select: { id: true, name: true, avatar: true } },
          replies: {
            where:   { deletedAt: null },
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.comment.count({ where: { postId: post.id, parentId: null } }),
    ]);

    return { comments, total };
  });

  // POST /api/posts/:postId/comments — auth requerida
  fastify.post('/api/posts/:postId/comments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { postId } = request.params;
    const { content, parentId } = request.body ?? {};

    if (!content?.trim()) return reply.code(400).send({ error: 'content es requerido' });

    const post = await fastify.prisma.post.findFirst({
      where: { OR: [{ id: postId }, { slug: postId }] },
      select: { id: true },
    });
    if (!post) return reply.code(404).send({ error: 'Post no encontrado' });

    // Validar que el parent existe y pertenece al mismo post
    if (parentId) {
      const parent = await fastify.prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== post.id) {
        return reply.code(400).send({ error: 'parentId inválido' });
      }
    }

    const comment = await fastify.prisma.comment.create({
      data: {
        postId:   post.id,
        userId:   request.currentUser.id,
        content:  content.trim(),
        parentId: parentId ?? null,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return reply.code(201).send({ comment });
  });

  // DELETE /api/comments/:id — soft delete (propio o admin)
  fastify.delete('/api/comments/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const comment = await fastify.prisma.comment.findUnique({ where: { id: request.params.id } });
    if (!comment) return reply.code(404).send({ error: 'Comentario no encontrado' });

    if (comment.userId !== request.currentUser.id && request.currentUser.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'No autorizado' });
    }

    await fastify.prisma.comment.update({
      where: { id: request.params.id },
      data:  { deletedAt: new Date(), content: '[comentario eliminado]' },
    });

    return reply.code(204).send();
  });

  // ─── Admin ───────────────────────────────────────────────────────────────────

  // GET /api/admin/comments
  fastify.get('/api/admin/comments', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { postId, deleted, limit = '50', offset = '0' } = request.query;
    const where = {};
    if (postId) where.postId = postId;
    if (deleted === 'true')  where.deletedAt = { not: null };
    if (deleted === 'false') where.deletedAt = null;

    const [comments, total] = await fastify.prisma.$transaction([
      fastify.prisma.comment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.comment.count({ where }),
    ]);

    return { comments, total };
  });

  // PATCH /api/admin/comments/:id — hard delete o restaurar
  fastify.patch('/api/admin/comments/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { action } = request.body ?? {};
    if (!['delete', 'restore'].includes(action)) {
      return reply.code(400).send({ error: 'action debe ser "delete" o "restore"' });
    }

    const comment = await fastify.prisma.comment.update({
      where: { id: request.params.id },
      data: action === 'restore'
        ? { deletedAt: null, content: request.body.content ?? undefined }
        : { deletedAt: new Date(), content: '[comentario eliminado]' },
    });

    return { comment };
  });
}
