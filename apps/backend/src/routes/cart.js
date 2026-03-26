// Carrito persistente en DB para usuarios autenticados
// Frontend llama POST /api/cart/merge al hacer login para sincronizar localStorage

const PRODUCT_SELECT = {
  id: true, name: true, slug: true, price: true,
  images: true, stock: true, status: true, category: true,
};

const CART_INCLUDE = {
  items: { include: { product: { select: PRODUCT_SELECT } } },
};

async function getOrCreateCart(prisma, userId) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: CART_INCLUDE,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: CART_INCLUDE,
  });
}

export default async function cartRoutes(fastify) {
  // GET /api/cart
  fastify.get('/api/cart', { preHandler: [fastify.authenticate] }, async (request) => {
    const cart = await getOrCreateCart(fastify.prisma, request.currentUser.id);
    return { cart };
  });

  // POST /api/cart/items — añadir o incrementar item
  fastify.post('/api/cart/items', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { productId, quantity = 1 } = request.body ?? {};
    if (!productId) return reply.code(400).send({ error: 'productId es requerido' });
    if (quantity < 1) return reply.code(400).send({ error: 'quantity debe ser >= 1' });

    const product = await fastify.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });

    const cart = await getOrCreateCart(fastify.prisma, request.currentUser.id);

    const existing = cart.items.find(i => i.productId === productId);
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (newQty > product.stock) {
      return reply.code(400).send({ error: `Stock insuficiente. Disponible: ${product.stock}` });
    }

    await fastify.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: newQty },
      create: { cartId: cart.id, productId, quantity },
    });

    await fastify.prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

    const updated = await getOrCreateCart(fastify.prisma, request.currentUser.id);
    return { cart: updated };
  });

  // PATCH /api/cart/items/:productId — actualizar cantidad exacta
  fastify.patch('/api/cart/items/:productId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { productId } = request.params;
    const { quantity } = request.body ?? {};
    if (!quantity || quantity < 1) return reply.code(400).send({ error: 'quantity debe ser >= 1' });

    const product = await fastify.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado' });
    if (quantity > product.stock) return reply.code(400).send({ error: `Stock insuficiente. Disponible: ${product.stock}` });

    const cart = await fastify.prisma.cart.findUnique({ where: { userId: request.currentUser.id } });
    if (!cart) return reply.code(404).send({ error: 'Carrito no encontrado' });

    await fastify.prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });

    const updated = await getOrCreateCart(fastify.prisma, request.currentUser.id);
    return { cart: updated };
  });

  // DELETE /api/cart/items/:productId — quitar item
  fastify.delete('/api/cart/items/:productId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { productId } = request.params;
    const cart = await fastify.prisma.cart.findUnique({ where: { userId: request.currentUser.id } });
    if (!cart) return reply.code(404).send({ error: 'Carrito no encontrado' });

    await fastify.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    const updated = await getOrCreateCart(fastify.prisma, request.currentUser.id);
    return { cart: updated };
  });

  // DELETE /api/cart — vaciar carrito
  fastify.delete('/api/cart', { preHandler: [fastify.authenticate] }, async (request) => {
    const cart = await fastify.prisma.cart.findUnique({ where: { userId: request.currentUser.id } });
    if (cart) {
      await fastify.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await fastify.prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
    }
    return { ok: true };
  });

  // POST /api/cart/merge — sincronizar localStorage al hacer login
  // Body: { items: [{ productId, quantity }] }
  fastify.post('/api/cart/merge', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const items = request.body?.items;
    if (!Array.isArray(items) || items.length === 0) return { ok: true };

    const cart = await getOrCreateCart(fastify.prisma, request.currentUser.id);

    for (const { productId, quantity } of items) {
      if (!productId || !quantity || quantity < 1) continue;

      const product = await fastify.prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      });
      if (!product) continue;

      const existing = cart.items.find(i => i.productId === productId);
      const newQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);
      if (newQty < 1) continue;

      await fastify.prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: newQty },
        create: { cartId: cart.id, productId, quantity: newQty },
      });
    }

    await fastify.prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

    const updated = await getOrCreateCart(fastify.prisma, request.currentUser.id);
    return { cart: updated };
  });
}
