import MercadoPagoConfig, { Payment } from 'mercadopago';
import { sendOrderStatusUpdateEmail } from '../services/email.js';

function getMPPayment() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  return new Payment(new MercadoPagoConfig({ accessToken: token }));
}

// MP status → Order status
const STATUS_MAP = {
  approved:   { orderStatus: 'processing', paymentStatus: 'approved'  },
  rejected:   { orderStatus: 'cancelled',  paymentStatus: 'rejected'  },
  in_process: { orderStatus: 'pending',    paymentStatus: 'in_process' },
  pending:    { orderStatus: 'pending',    paymentStatus: 'pending'   },
};

export default async function webhookRoutes(fastify) {

  /**
   * POST /api/webhooks/mercadopago
   * MP envía notificaciones IPN: topic=payment&id=<payment_id>
   * o eventos v2: { type: "payment", data: { id } }
   */
  fastify.post('/api/webhooks/mercadopago', async (request, reply) => {
    // Responder 200 inmediatamente (MP lo requiere)
    reply.code(200).send({ ok: true });

    try {
      // Soportar IPN clásico (query) y webhooks v2 (body)
      const paymentId = request.query.id
        ?? request.body?.data?.id
        ?? request.body?.id;

      if (!paymentId) return;

      const mpPayment = getMPPayment();
      if (!mpPayment) {
        fastify.log.warn('MP_ACCESS_TOKEN no configurado — webhook ignorado');
        return;
      }

      const payment = await mpPayment.get({ id: paymentId });
      const externalRef = payment.external_reference; // Order.id

      if (!externalRef) return;

      const mapping = STATUS_MAP[payment.status] ?? STATUS_MAP.pending;

      const order = await fastify.prisma.order.findUnique({
        where:   { id: externalRef },
        include: { user: { select: { email: true, name: true } } },
      });
      if (!order) return;

      const previousStatus = order.status;

      await fastify.prisma.order.update({
        where: { id: externalRef },
        data:  {
          paymentStatus: mapping.paymentStatus,
          status:        mapping.orderStatus,
        },
      });

      // Email si cambió el estado
      if (previousStatus !== mapping.orderStatus) {
        const email = order.user?.email ?? order.shippingAddress?.email;
        if (email) {
          sendOrderStatusUpdateEmail(email, {
            ...order,
            status: mapping.orderStatus,
          }, previousStatus).catch(() => {});
        }
      }
    } catch (err) {
      fastify.log.error({ err }, 'Error procesando webhook MP');
    }
  });
}
