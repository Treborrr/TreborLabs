export default async function analyticsRoutes(fastify) {

  // GET /api/admin/analytics?period=week|month|year
  fastify.get('/api/admin/analytics', { preHandler: [fastify.requireAdmin] }, async (request) => {
    const { period = 'month' } = request.query;

    const periodDays = { week: 7, month: 30, year: 365 }[period] ?? 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [
      revenueAgg,
      totalOrders,
      ordersByStatus,
      topProducts,
      newUsers,
      revenueByDay,
    ] = await fastify.prisma.$transaction([
      // Total revenue in period
      fastify.prisma.order.aggregate({
        where:  { createdAt: { gte: since }, status: { not: 'cancelled' } },
        _sum:   { total: true },
        _count: true,
      }),
      // Order count
      fastify.prisma.order.count({ where: { createdAt: { gte: since } } }),
      // Orders by status
      fastify.prisma.order.groupBy({
        by:     ['status'],
        where:  { createdAt: { gte: since } },
        _count: true,
      }),
      // Top 5 products by quantity sold
      fastify.prisma.orderItem.groupBy({
        by:      ['productId', 'productName'],
        where:   { order: { createdAt: { gte: since }, status: { not: 'cancelled' } } },
        _sum:    { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take:    5,
      }),
      // New users
      fastify.prisma.user.count({ where: { createdAt: { gte: since } } }),
      // Revenue per day (raw query for grouping by date)
      fastify.prisma.$queryRaw`
        SELECT
          DATE("createdAt") AS day,
          COUNT(*)::int      AS orders,
          SUM(total)         AS revenue
        FROM "Order"
        WHERE "createdAt" >= ${since}
          AND status != 'cancelled'
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `,
    ]);

    return {
      period,
      since,
      revenue:      revenueAgg._sum.total ?? 0,
      totalOrders,
      ordersByStatus: Object.fromEntries(ordersByStatus.map(r => [r.status, r._count])),
      topProducts:  topProducts.map(p => ({
        productId:   p.productId,
        productName: p.productName,
        totalSold:   p._sum.quantity,
      })),
      newUsers,
      revenueByDay,
    };
  });
}
