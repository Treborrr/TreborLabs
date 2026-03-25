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
    if (category) where.category = category;
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await fastify.prisma.$transaction([
      fastify.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      fastify.prisma.product.count({ where }),
    ]);

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
    const product = await fastify.prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });
    return { product };
  });

  // PUT /api/products/:id — editar producto (admin)
  fastify.put('/api/products/:id', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const data = { ...request.body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock);

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
}
