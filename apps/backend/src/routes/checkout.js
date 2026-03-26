import MercadoPagoConfig, { Preference } from 'mercadopago';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '../services/email.js';


function getMPClient() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  const client = new MercadoPagoConfig({ accessToken: token });
  return new Preference(client);
}

export default async function checkoutRoutes(fastify) {

  /**
   * POST /api/checkout
   * Body: {
   *   items:           [{ productId, quantity, variantInfo? }]
   *   shippingAddress: { fullName, phone, line1, line2?, district, city, region }
   *   shippingZoneId:  string
   *   couponCode?:     string
   * }
   *
   * Transacción atómica:
   *  1. Valida stock de cada ítem
   *  2. Calcula subtotal, shippingCost, discount, total
   *  3. Crea Order + OrderItem[]
   *  4. Decrementa stock
   *  5. Incrementa coupon.usedCount
   *  6. Crea preferencia MercadoPago (si hay credenciales)
   *  7. Envía email de confirmación
   *  8. Vacía carrito DB del usuario (si auth)
   */
  fastify.post('/api/checkout', { preHandler: [fastify.optionalAuth] }, async (request, reply) => {
    const { items, shippingAddress, shippingZoneId, couponCode } = request.body ?? {};

    if (!items?.length)     return reply.code(400).send({ error: 'Tu carrito está vacío' });
    if (!shippingAddress)   return reply.code(400).send({ error: 'Dirección de envío requerida' });
    if (!shippingZoneId)    return reply.code(400).send({ error: 'No hay cobertura de envío para tu región. Selecciona otra dirección o contáctanos por WhatsApp.' });

    // ── 1. Pre-validación rápida de existencia ──────────────────────────────
    const productIds = [...new Set(items.map(i => i.productId))];
    const preProducts = await fastify.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    if (preProducts.length !== productIds.length) {
      return reply.code(404).send({ error: 'Uno o más productos no fueron encontrados' });
    }

    // ── 2. Zona de envío ────────────────────────────────────────────────────
    const zone = await fastify.prisma.shippingZone.findUnique({ where: { id: shippingZoneId } });
    if (!zone || !zone.enabled) {
      return reply.code(400).send({ error: 'Zona de envío no válida' });
    }

    // ── 3. Pre-validación de cupón ───────────────────────────────────────────
    if (couponCode) {
      const preCoupon = await fastify.prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (!preCoupon || !preCoupon.enabled)
        return reply.code(400).send({ error: 'Cupón no válido' });
      if (preCoupon.expiresAt && new Date() > preCoupon.expiresAt)
        return reply.code(400).send({ error: 'Cupón expirado' });
      if (preCoupon.maxUses !== null && preCoupon.usedCount >= preCoupon.maxUses)
        return reply.code(400).send({ error: 'Cupón agotado' });
    }

    // ── 4. Transacción atómica (stock + cupón validados dentro) ──────────────
    let order;
    try {
      order = await fastify.prisma.$transaction(async (tx) => {
        // Cargar productos con lock de lectura para calcular totales
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));

        // Validar stock dentro de la transacción
        for (const item of items) {
          const p = productMap[item.productId];
          if (p.stock < item.quantity) {
            throw Object.assign(new Error(`Stock insuficiente para "${p.name}". Disponible: ${p.stock}`), { statusCode: 400 });
          }
        }

        let subtotal = 0;
        const orderItemsData = items.map(item => {
          const product = productMap[item.productId];
          subtotal += product.price * item.quantity;
          return {
            productId:   item.productId,
            productName: product.name,
            price:       product.price,
            quantity:    item.quantity,
            variantInfo: item.variantInfo ?? null,
          };
        });

        const shippingCost = zone.price;
        let discount = 0;
        let coupon   = null;

        if (couponCode) {
          // Validar cupón dentro de la transacción para evitar TOCTOU
          coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
          if (!coupon || !coupon.enabled)
            throw Object.assign(new Error('Cupón no válido'), { statusCode: 400 });
          if (coupon.expiresAt && new Date() > coupon.expiresAt)
            throw Object.assign(new Error('Cupón expirado'), { statusCode: 400 });
          if (coupon.minOrderTotal !== null && subtotal < coupon.minOrderTotal)
            throw Object.assign(new Error(`Mínimo de compra para este cupón: $${coupon.minOrderTotal.toFixed(2)}`), { statusCode: 400 });

          // Incremento atómico: updateMany con condición de cupo disponible
          const claimed = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              OR: [{ maxUses: null }, { usedCount: { lt: coupon.maxUses } }],
            },
            data: { usedCount: { increment: 1 } },
          });
          if (claimed.count === 0) {
            throw Object.assign(new Error('Cupón agotado'), { statusCode: 400 });
          }

          discount = coupon.type === 'percent'
            ? parseFloat((subtotal * coupon.value / 100).toFixed(2))
            : Math.min(coupon.value, subtotal);
        }

        const total = parseFloat((subtotal + shippingCost - discount).toFixed(2));

        const newOrder = await tx.order.create({
          data: {
            userId:          request.currentUser?.id ?? null,
            subtotal,
            shippingCost,
            discount,
            total,
            status:          'pending',
            shippingAddress,
            shippingZoneId:  zone.id,
            couponId:        coupon?.id ?? null,
            paymentStatus:   'pending',
            orderItems: { create: orderItemsData },
          },
          include: { orderItems: true, shippingZone: true, coupon: true },
        });

        // Decrementar stock con validación de no negativos
        for (const item of items) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data:  { stock: { decrement: item.quantity } },
          });
          if (result.count === 0) {
            throw Object.assign(new Error(`Stock insuficiente para el producto: ${productMap[item.productId].name}`), { statusCode: 400 });
          }
        }

        return newOrder;
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return reply.code(status).send({ error: err.message || 'Error procesando el pedido' });
    }

    // ── 6. Vaciar carrito DB (si auth) ───────────────────────────────────────
    if (request.currentUser) {
      const cart = await fastify.prisma.cart.findUnique({
        where: { userId: request.currentUser.id },
      });
      if (cart) {
        await fastify.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    // ── 7. MercadoPago preference ────────────────────────────────────────────
    let initPoint   = null;
    let preferenceId = null;

    const mp = getMPClient();
    if (mp) {
      try {
        const mpItems = order.orderItems.map(oi => ({
          id:          oi.productId,
          title:       oi.productName,
          quantity:    oi.quantity,
          unit_price:  oi.price,
          currency_id: 'PEN',
        }));

        const pref = await mp.create({
          body: {
            items:        mpItems,
            external_reference: order.id,
            payer:        request.currentUser
              ? { email: request.currentUser.email }
              : undefined,
            back_urls: {
              success: `${process.env.FRONTEND_URL}/orders/${order.id}/confirmation?status=approved`,
              failure: `${process.env.FRONTEND_URL}/orders/${order.id}/confirmation?status=failure`,
              pending: `${process.env.FRONTEND_URL}/orders/${order.id}/confirmation?status=pending`,
            },
            auto_return: 'approved',
            notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
          },
        });

        initPoint    = pref.init_point;
        preferenceId = pref.id;

        await fastify.prisma.order.update({
          where: { id: order.id },
          data:  { paymentId: preferenceId },
        });
      } catch (mpErr) {
        fastify.log.warn({ err: mpErr }, 'MercadoPago preference failed — order saved without MP link');
      }
    }

    // ── 8. Email confirmación ────────────────────────────────────────────────
    const emailTarget = request.currentUser?.email ?? shippingAddress.email;
    if (emailTarget) {
      sendOrderConfirmationEmail(emailTarget, order, shippingAddress).catch(() => {});
    }
    // A6.3 — Notificar al admin de nuevo pedido
    if (process.env.ADMIN_EMAIL) {
      sendAdminNewOrderEmail(process.env.ADMIN_EMAIL, order, shippingAddress).catch(() => {});
    }

    return reply.code(201).send({
      order: {
        id:          order.id,
        total:       order.total,
        status:      order.status,
        paymentStatus: order.paymentStatus,
      },
      payment: { initPoint, preferenceId },
    });
  });
}
