function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function postsRoutes(fastify) {
  // GET /api/posts — lista pública (solo publicados)
  fastify.get('/api/posts', async (request) => {
    const { category, search, limit = '20', offset = '0' } = request.query;
    const where = { status: 'published' };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await fastify.prisma.$transaction([
      fastify.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: { author: { select: { id: true, name: true, avatar: true } } },
      }),
      fastify.prisma.post.count({ where }),
    ]);

    return { posts, total };
  });

  // GET /api/posts/all — todos los posts (admin)
  fastify.get('/api/posts/all', { preHandler: [fastify.requireAdmin] }, async () => {
    const posts = await fastify.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    return { posts };
  });

  // POST /api/posts — crear post (admin)
  fastify.post('/api/posts', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { title, slug, content, excerpt, coverImage, category, status, authorId } = request.body;

    if (!title || !content) {
      return reply.code(400).send({ error: 'title y content son requeridos' });
    }

    const isPublished = status === 'published';
    const post = await fastify.prisma.post.create({
      data: {
        title,
        slug: slug || generateSlug(title),
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        category: category || null,
        status: status || 'draft',
        authorId: authorId || request.currentUser.id,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return reply.code(201).send({ post });
  });

  // GET /api/posts/:id — detalle (público=solo published, admin=cualquiera)
  fastify.get('/api/posts/:id', { preHandler: [fastify.optionalAuth] }, async (request, reply) => {
    const { id } = request.params;
    const isAdmin = request.currentUser?.role === 'ADMIN';

    const where = { OR: [{ id }, { slug: id }] };
    if (!isAdmin) where.status = 'published';

    const post = await fastify.prisma.post.findFirst({
      where,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    if (!post) return reply.code(404).send({ error: 'Post no encontrado' });
    return { post };
  });

  // PUT /api/posts/:id — editar post (admin)
  fastify.put('/api/posts/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const data = { ...request.body };

    // Setear publishedAt si cambia a published por primera vez
    if (data.status === 'published') {
      const existing = await fastify.prisma.post.findUnique({
        where: { id },
        select: { status: true, publishedAt: true },
      });
      if (existing && existing.status !== 'published' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const post = await fastify.prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return { post };
  });

  // DELETE /api/posts/:id — eliminar post (admin)
  fastify.delete('/api/posts/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    await fastify.prisma.post.delete({ where: { id } });
    return reply.code(204).send();
  });
}
