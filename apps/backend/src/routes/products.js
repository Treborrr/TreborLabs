function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function productsRoutes(fastify) {
  // GET /api/products — lista pública con filtros
  fastify.get('/api/products', async (request) => {
    const { category, status, search, featured, limit = '50', offset = '0' } = request.query;
    const where = {};
    // A7.1: Si se filtra por category, verificar que existe; si no existe, retornar []
    if (category) {
      const categoryExists = await fastify.prisma.category.findUnique({ where: { slug: category } });
      if (!categoryExists) return { products: [], total: 0 };
      where.category = category;
    }
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    // A7.3 Limit max 100
    const take = Math.min(parseInt(limit) || 50, 100);
    const skip = parseInt(offset) || 0;

    const [rawProducts, total] = await fastify.prisma.$transaction([
      fastify.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,

        include: {
          variants: { orderBy: { name: 'asc' } },
          reviews:  { select: { rating: true } },
        },
      }),
      fastify.prisma.product.count({ where }),
    ]);

    const products = rawProducts.map(p => ({
      ...p,
      ratingAvg:   p.reviews.length ? +(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1) : null,
      reviewCount: p.reviews.length,
      reviews:     undefined,
    }));

    return { products, total };
  });

  // POST /api/products — crear producto (admin)
  fastify.post('/api/products', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { name, slug, description, price, category, status, images, specs, featured, stock } = request.body;

    if (!name || price === undefined || !category) {
      return reply.code(400).send({ error: 'name, price y category son requeridos' });
    }

    const product = await fastify.prisma.product.create({
      data: {
        name,
        slug: slug || generateSlug(name),
        description: description || null,
        price: parseFloat(price),
        category,
        status: status || 'in_stock',
        images: images || [],
        specs: specs || {},
        featured: featured || false,
        stock: parseInt(stock) || 0,
      },
    });

    return reply.code(201).send({ product });
  });

  // GET /api/products/:id — detalle por id o slug
  fastify.get('/api/products/:id', async (request, reply) => {
    const { id } = request.params;
    const raw = await fastify.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        variants: { orderBy: { name: 'asc' } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!raw) return reply.code(404).send({ error: 'Producto no encontrado' });
    const product = {
      ...raw,
      ratingAvg:   raw.reviews.length ? +(raw.reviews.reduce((s, r) => s + r.rating, 0) / raw.reviews.length).toFixed(1) : null,
      reviewCount: raw.reviews.length,
    };
    return { product };
  });

  // PUT /api/products/:id — editar producto (admin)
  fastify.put('/api/products/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const b = request.body ?? {};

    const data = {};
    if (b.name        !== undefined) data.name        = b.name;
    if (b.slug        !== undefined) data.slug        = b.slug;
    if (b.description !== undefined) data.description = b.description ?? null;
    if (b.price       !== undefined) data.price       = parseFloat(b.price);
    if (b.stock       !== undefined) data.stock       = parseInt(b.stock) || 0;
    if (b.category    !== undefined) data.category    = b.category;
    if (b.status      !== undefined) data.status      = b.status;
    if (b.featured    !== undefined) data.featured    = Boolean(b.featured);
    if (b.images      !== undefined) data.images      = b.images;
    if (b.specs       !== undefined) data.specs       = b.specs;
    if (b.afiche      !== undefined) data.afiche      = b.afiche ?? null;

    const product = await fastify.prisma.product.update({
      where: { id },
      data,
    });

    return { product };
  });

  // DELETE /api/products/:id — eliminar producto (admin)
  fastify.delete('/api/products/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    await fastify.prisma.product.delete({ where: { id } });
    return reply.code(204).send();
  });

  // ── Variants ────────────────────────────────────────────────────────────────

  // GET /api/products/:id/variants
  fastify.get('/api/products/:id/variants', async (request, reply) => {
    const product = await fastify.prisma.product.findFirst({
      where: { OR: [{ id: request.params.id }, { slug: request.params.id }] },
      select: { id: true },
    });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    const variants = await fastify.prisma.productVariant.findMany({
      where:   { productId: product.id },
      orderBy: { name: 'asc' },
    });
    return { variants };
  });

  // POST /api/products/:id/variants (admin)
  fastify.post('/api/products/:id/variants', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { name, value, hexColor, available } = request.body ?? {};
    if (!name || !value) return reply.code(400).send({ error: 'name y value son requeridos' });

    const product = await fastify.prisma.product.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    const variant = await fastify.prisma.productVariant.create({
      data: { productId: product.id, name, value, hexColor: hexColor ?? null, available: available ?? true },
    });
    return reply.code(201).send({ variant });
  });

  // PATCH /api/products/:id/variants/:variantId (admin)
  fastify.patch('/api/products/:id/variants/:variantId', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { name, value, hexColor, available } = request.body ?? {};
    const data = {};
    if (name      !== undefined) data.name      = name;
    if (value     !== undefined) data.value     = value;
    if (hexColor  !== undefined) data.hexColor  = hexColor;
    if (available !== undefined) data.available = available;

    const variant = await fastify.prisma.productVariant.update({
      where: { id: request.params.variantId },
      data,
    });
    return { variant };
  });

  // DELETE /api/products/:id/variants/:variantId (admin)
  fastify.delete('/api/products/:id/variants/:variantId', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    await fastify.prisma.productVariant.delete({ where: { id: request.params.variantId } });
    return reply.code(204).send();
  });

  // ── Reviews ─────────────────────────────────────────────────────────────────

  // GET /api/products/:id/reviews
  fastify.get('/api/products/:id/reviews', async (request, reply) => {
    const product = await fastify.prisma.product.findFirst({
      where: { OR: [{ id: request.params.id }, { slug: request.params.id }] },
      select: { id: true },
    });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    const { limit = '20', offset = '0' } = request.query;
    const [reviews, total] = await fastify.prisma.$transaction([
      fastify.prisma.review.findMany({
        where:   { productId: product.id },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
      }),
      fastify.prisma.review.count({ where: { productId: product.id } }),
    ]);
    return { reviews, total };
  });

  // POST /api/products/:id/reviews (auth required)
  fastify.post('/api/products/:id/reviews', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { rating, title, content } = request.body ?? {};
    if (!rating || !content) return reply.code(400).send({ error: 'rating y content son requeridos' });
    if (rating < 1 || rating > 5) return reply.code(400).send({ error: 'rating debe estar entre 1 y 5' });

    const product = await fastify.prisma.product.findFirst({
      where: { OR: [{ id: request.params.id }, { slug: request.params.id }] },
      select: { id: true },
    });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    // Verificar que el usuario haya comprado el producto
    const hasPurchased = await fastify.prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { userId: request.currentUser.id, status: { in: ['delivered', 'shipped'] } },
      },
    });
    if (!hasPurchased) {
      return reply.code(403).send({ error: 'Solo puedes reseñar productos que hayas comprado y recibido' });
    }

    try {
      const review = await fastify.prisma.review.create({
        data: {
          productId:       product.id,
          userId:          request.currentUser.id,
          rating:          parseInt(rating),
          title:           title ?? null,
          content,
          verifiedPurchase: true,
        },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });
      return reply.code(201).send({ review });
    } catch (e) {
      if (e.code === 'P2002') {
        return reply.code(409).send({ error: 'Ya dejaste una reseña para este producto' });
      }
      throw e;
    }
  });

  // PATCH /api/products/:id/reviews/:reviewId (auth — own review only)
  fastify.patch('/api/products/:id/reviews/:reviewId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { rating, title, content } = request.body ?? {};

    const existing = await fastify.prisma.review.findUnique({ where: { id: request.params.reviewId } });
    if (!existing) return reply.code(404).send({ error: 'Reseña no encontrada' });
    if (existing.userId !== request.currentUser.id && request.currentUser.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'No autorizado' });
    }

    const data = {};
    if (rating  !== undefined) data.rating  = parseInt(rating);
    if (title   !== undefined) data.title   = title;
    if (content !== undefined) data.content = content;

    const review = await fastify.prisma.review.update({
      where:   { id: request.params.reviewId },
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return { review };
  });

  // DELETE /api/admin/reviews/:id (admin)
  fastify.delete('/api/admin/reviews/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    await fastify.prisma.review.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
