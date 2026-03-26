const PRODUCT_SELECT = {
  id: true, name: true, slug: true, price: true,
  images: true, category: true, status: true, stock: true,
};

async function getOrCreateWishlist(prisma, userId) {
  return prisma.wishlist.upsert({
    where:  { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { select: PRODUCT_SELECT } } } },
  });
}

export default async function wishlistRoutes(fastify) {

  // GET /api/users/me/wishlist
  fastify.get('/api/users/me/wishlist', { preHandler: [fastify.authenticate] }, async (request) => {
    const wishlist = await fastify.prisma.wishlist.findUnique({
      where:   { userId: request.currentUser.id },
      include: { items: { include: { product: { select: PRODUCT_SELECT } }, orderBy: { addedAt: 'desc' } } },
    });
    return { items: wishlist?.items ?? [] };
  });

  // POST /api/wishlist — body { productId }
  fastify.post('/api/wishlist', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { productId } = request.body ?? {};
    if (!productId) return reply.code(400).send({ error: 'productId es requerido' });

    const product = await fastify.prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    // Upsert wishlist
    const wishlist = await fastify.prisma.wishlist.upsert({
      where:  { userId: request.currentUser.id },
      update: {},
      create: { userId: request.currentUser.id },
    });

    try {
      const item = await fastify.prisma.wishlistItem.create({
        data:    { wishlistId: wishlist.id, productId },
        include: { product: { select: PRODUCT_SELECT } },
      });
      return reply.code(201).send({ item });
    } catch (e) {
      if (e.code === 'P2002') {
        return reply.code(409).send({ error: 'Producto ya está en tu wishlist' });
      }
      throw e;
    }
  });

  // DELETE /api/wishlist/:productId
  fastify.delete('/api/wishlist/:productId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const wishlist = await fastify.prisma.wishlist.findUnique({
      where: { userId: request.currentUser.id },
      select: { id: true },
    });
    if (!wishlist) return reply.code(404).send({ error: 'Wishlist no encontrada' });

    await fastify.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId: request.params.productId },
    });

    return reply.code(204).send();
  });

  // GET /api/wishlist/check/:productId
  fastify.get('/api/wishlist/check/:productId', { preHandler: [fastify.authenticate] }, async (request) => {
    const wishlist = await fastify.prisma.wishlist.findUnique({
      where:  { userId: request.currentUser.id },
      select: { id: true },
    });
    if (!wishlist) return { inWishlist: false };

    const item = await fastify.prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: request.params.productId } },
    });
    return { inWishlist: !!item };
  });
}
