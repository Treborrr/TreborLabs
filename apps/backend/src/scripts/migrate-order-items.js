/**
 * migrate-order-items.js
 * Convierte Order.items (JSON legacy) → registros OrderItem.
 * Ejecutar UNA VEZ: node src/scripts/migrate-order-items.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany({
    where: {
      items: { not: null },
      orderItems: { none: {} },   // solo las que aún no migraron
    },
  });

  console.log(`Órdenes a migrar: ${orders.length}`);
  let migrated = 0;

  for (const order of orders) {
    const legacyItems = Array.isArray(order.items) ? order.items : [];
    if (!legacyItems.length) continue;

    const orderItemsData = legacyItems.map(i => ({
      orderId:     order.id,
      productId:   i.id   || 'unknown',
      productName: i.name || 'Producto eliminado',
      price:       parseFloat(i.price) || 0,
      quantity:    parseInt(i.qty || i.quantity || 1),
    }));

    // Calcular subtotal si faltaba
    const subtotal = orderItemsData.reduce((s, i) => s + i.price * i.quantity, 0);

    await prisma.$transaction([
      prisma.orderItem.createMany({ data: orderItemsData }),
      prisma.order.update({
        where: { id: order.id },
        data:  {
          subtotal:        order.subtotal || subtotal,
          shippingAddress: order.shippingAddress ?? order.address ?? null,
        },
      }),
    ]);

    migrated++;
    console.log(`  ✓ Orden ${order.id.slice(-6).toUpperCase()} — ${orderItemsData.length} item(s)`);
  }

  console.log(`\nMigración completa: ${migrated}/${orders.length} órdenes.`);
}

run()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
