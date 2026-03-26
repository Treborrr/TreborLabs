// Spin wheel prize table (weights must sum to 100)
const PRIZES = [
  { label: 'S/10 de descuento',  type: 'fixed',   value: 10,  weight: 50 },
  { label: 'Envío gratis',       type: 'shipping', value: 0,   weight: 30 },
  { label: 'S/15 de descuento',  type: 'fixed',   value: 15,  weight: 13 },
  { label: 'S/20 de descuento',  type: 'fixed',   value: 20,  weight: 6  },
  { label: 'S/50 de descuento',  type: 'fixed',   value: 50,  weight: 1  },
];

function pickPrize() {
  const rand = Math.random() * 100;
  let acc = 0;
  for (const prize of PRIZES) {
    acc += prize.weight;
    if (rand < acc) return prize;
  }
  return PRIZES[0];
}

function randomCode(prefix = 'SPIN') {
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default async function referralRoutes(fastify) {

  // GET /api/referral/me — link propio + stats
  fastify.get('/api/referral/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const user = await fastify.prisma.user.findUnique({
      where:  { id: request.currentUser.id },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true, spinUsed: true, createdAt: true,
            referred: { select: { id: true, name: true, createdAt: true } },
          },
        },
      },
    });

    const total    = user.referrals.length;
    const spinsUsed = user.referrals.filter(r => r.spinUsed).length;
    const spinsAvailable = total - spinsUsed;

    return {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/?ref=${user.referralCode}`,
      stats: { total, spinsUsed, spinsAvailable },
      referrals: user.referrals,
    };
  });

  // POST /api/referral/spin — girar ruleta
  fastify.post('/api/referral/spin', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    // Buscar un referral sin spin usado
    const referral = await fastify.prisma.referral.findFirst({
      where: { referrerId: request.currentUser.id, spinUsed: false },
    });

    if (!referral) {
      return reply.code(400).send({ error: 'No tienes ruletas disponibles' });
    }

    const prize = pickPrize();

    // Crear cupón (envío gratis = fixed $0 — frontend lo interpreta como envío gratis)
    const coupon = await fastify.prisma.coupon.create({
      data: {
        code:      randomCode(),
        type:      'fixed',
        value:     prize.value,
        maxUses:   1,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        enabled:   true,
      },
    });

    // Marcar spin usado + asignar cupón
    await fastify.prisma.referral.update({
      where: { id: referral.id },
      data:  { spinUsed: true, couponId: coupon.id },
    });

    // Notificación
    await fastify.prisma.notification.create({
      data: {
        userId:  request.currentUser.id,
        type:    'coupon_won',
        title:   '¡Ganaste un premio!',
        body:    `${prize.label} — Código: ${coupon.code}`,
        payload: { couponCode: coupon.code, prize: prize.label },
      },
    });

    return {
      prize: prize.label,
      coupon: { code: coupon.code, value: coupon.value, expiresAt: coupon.expiresAt },
    };
  });
}
