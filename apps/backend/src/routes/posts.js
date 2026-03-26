function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function postsRoutes(fastify) {
  // GET /api/posts — lista pública (solo publicados), filtros: category, tag, search
  fastify.get('/api/posts', async (request) => {
    const { category, tag, search, limit = '20', offset = '0' } = request.query;
    const where = { status: 'published' };

    if (category) where.category = category; // A7.2 — filtro por category
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    // A7.3 — Limit max 100
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = parseInt(offset) || 0;

    const [posts, total] = await fastify.prisma.$transaction([
      fastify.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take,
        skip,
        include: { author: { select: { id: true, name: true, avatar: true } } },
      }),
      fastify.prisma.post.count({ where }),
    ]);

    return { posts, total };
  });


  // GET /api/posts/tags — tags únicos de posts publicados
  fastify.get('/api/posts/tags', async () => {
    const posts = await fastify.prisma.post.findMany({
      where: { status: 'published' },
      select: { tags: true },
    });
    const tags = [...new Set(posts.flatMap(p => p.tags))].sort();
    return { tags };
  });

  // GET /api/posts/all — todos los posts (admin)
  fastify.get('/api/posts/all', { preHandler: [fastify.requireAdmin] }, async () => {
    const posts = await fastify.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    return { posts };
  });

  // GET /api/posts/:slug — detalle por slug (público=published, admin=cualquiera)
  fastify.get('/api/posts/:slug', { preHandler: [fastify.optionalAuth] }, async (request, reply) => {
    const { slug } = request.params;
    const isAdmin = request.currentUser?.role === 'ADMIN';

    const where = { OR: [{ slug }, { id: slug }] };
    if (!isAdmin) where.status = 'published';

    const post = await fastify.prisma.post.findFirst({
      where,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    if (!post) return reply.code(404).send({ error: 'Post no encontrado' });

    // Posts relacionados (misma categoría, excluye el actual)
    const related = post.category
      ? await fastify.prisma.post.findMany({
          where: { status: 'published', category: post.category, id: { not: post.id } },
          orderBy: { publishedAt: 'desc' },
          take: 3,
          select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
        })
      : [];

    return { post, related };
  });

  // POST /api/posts — crear post (admin)
  fastify.post('/api/posts', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { title, slug, content, excerpt, coverImage, category, tags, status, authorId } = request.body;

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
        tags: tags || [],
        status: status || 'draft',
        authorId: authorId || request.currentUser.id,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return reply.code(201).send({ post });
  });

  // PUT /api/posts/:id — editar post (admin)
  fastify.put('/api/posts/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const { title, slug, content, excerpt, coverImage, category, tags, status, authorId } = request.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags;
    if (status !== undefined) data.status = status;
    if (authorId !== undefined) data.authorId = authorId;

    if (status === 'published') {
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
    await fastify.prisma.post.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
