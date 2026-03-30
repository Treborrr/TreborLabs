import MercadoPagoConfig, { Payment } from 'mercadopago';
import { sendOrderStatusUpdateEmail } from '../services/email.js';
import crypto from 'crypto';

/**
 * Valida la firma HMAC-SHA256 del webhook de MercadoPago.
 * Referencia: https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks
 */
function validateMPSignature(headers, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // Sin secreto configurado: permitir (pero advertir en logs)

  const xSignature = headers['x-signature'];
  const xRequestId = headers['x-request-id'];
  if (!xSignature || !xRequestId) return false;

  // Formato: "ts=<timestamp>,v1=<hmac_hex>"
  const parts = Object.fromEntries(
    xSignature.split(',').flatMap(p => {
      const idx = p.indexOf('=');
      return idx > 0 ? [[p.slice(0, idx).trim(), p.slice(idx + 1).trim()]] : [];
    })
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return false;
  }
}

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

      // Validar firma HMAC antes de procesar
      if (!validateMPSignature(request.headers, paymentId)) {
        fastify.log.warn({ paymentId }, 'Webhook MP rechazado: firma HMAC inválida');
        return;
      }

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
