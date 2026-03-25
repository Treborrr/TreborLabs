import bcrypt from 'bcryptjs';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendChangePasswordConfirmEmail,
} from '../services/email.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SALT_ROUNDS  = 12;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos

// ── Helpers ───────────────────────────────────────────────────────────────────

function expiresAt() {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

async function createMagicToken(prisma, { email, userId, type, payload }) {
  // Eliminar tokens previos del mismo tipo para este email
  await prisma.magicToken.deleteMany({
    where: {
      email,
      type,
      OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
    },
  });

  return prisma.magicToken.create({
    data: { email, userId, type, payload, expiresAt: expiresAt() },
  });
}

async function consumeToken(prisma, token, type) {
  const record = await prisma.magicToken.findUnique({ where: { token } });
  if (!record)              throw { status: 400, message: 'Enlace inválido' };
  if (record.type !== type) throw { status: 400, message: 'Enlace inválido' };
  if (record.usedAt)        throw { status: 400, message: 'Este enlace ya fue utilizado' };
  if (record.expiresAt < new Date()) throw { status: 400, message: 'El enlace ha expirado. Solicita uno nuevo.' };

  await prisma.magicToken.update({ where: { token }, data: { usedAt: new Date() } });
  return record;
}

const RATE_AUTH  = { max: 8,  timeWindow: '15 minutes' };
const RATE_TIGHT = { max: 5,  timeWindow: '15 minutes' };

// ── Routes ────────────────────────────────────────────────────────────────────

export default async function authEmailRoutes(fastify) {

  // POST /api/auth/register
  fastify.post('/api/auth/register', { config: { rateLimit: RATE_TIGHT } }, async (request, reply) => {
    const { email, password, name } = request.body ?? {};
    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Nombre, email y contraseña son requeridos' });
    }
    if (password.length < 8) {
      return reply.code(400).send({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // No revelamos si existe o no por seguridad, pero aquí sí podemos dar el mensaje
      return reply.code(409).send({ error: 'Ya existe una cuenta con ese correo' });
    }

    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await fastify.prisma.user.create({
      data: { email, name, password: hashedPw, emailVerified: false },
    });

    const mt = await createMagicToken(fastify.prisma, {
      email, userId: user.id, type: 'verify_email',
    });

    await sendVerificationEmail(email, mt.token).catch(err =>
      fastify.log.error({ err }, 'Error enviando email de verificación')
    );

    return reply.code(201).send({ message: 'Revisa tu correo para confirmar tu cuenta' });
  });

  // GET /api/auth/verify-email?token=XXX  — link que llega al correo
  fastify.get('/api/auth/verify-email', { config: { rateLimit: RATE_AUTH } }, async (request, reply) => {
    const { token } = request.query;
    if (!token) return reply.redirect(`${FRONTEND_URL}/login?error=invalid_link`);

    try {
      const record = await consumeToken(fastify.prisma, token, 'verify_email');
      await fastify.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      });
      const user = await fastify.prisma.user.findUnique({ where: { id: record.userId } });
      const jwt  = fastify.jwt.sign({ userId: user.id }, { expiresIn: '7d' });
      return reply.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(jwt)}`);
    } catch (err) {
      const msg = encodeURIComponent(err.message || 'invalid_link');
      return reply.redirect(`${FRONTEND_URL}/login?error=${msg}`);
    }
  });

  // POST /api/auth/login
  fastify.post('/api/auth/login', { config: { rateLimit: RATE_AUTH } }, async (request, reply) => {
    const { email, password } = request.body ?? {};
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email y contraseña son requeridos' });
    }

    const user = await fastify.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' });
    }
    if (user.suspended) {
      return reply.code(403).send({ error: 'Cuenta suspendida. Contacta al soporte.' });
    }
    if (!user.emailVerified) {
      return reply.code(401).send({ error: 'Debes verificar tu correo antes de iniciar sesión' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' });
    }

    // Actualizar lastSeenAt
    await fastify.prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });

    const jwt = fastify.jwt.sign({ userId: user.id }, { expiresIn: '7d' });
    return { token: jwt, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } };
  });

  // POST /api/auth/forgot-password
  fastify.post('/api/auth/forgot-password', { config: { rateLimit: RATE_TIGHT } }, async (request, reply) => {
    const { email } = request.body ?? {};
    if (!email) return reply.code(400).send({ error: 'Email requerido' });

    // Respuesta siempre igual (no revelar si el email existe)
    const genericResponse = { message: 'Si existe una cuenta con ese correo, recibirás un enlace en los próximos minutos.' };

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return reply.send(genericResponse);

    const mt = await createMagicToken(fastify.prisma, {
      email, userId: user.id, type: 'reset_password',
    });

    await sendPasswordResetEmail(email, mt.token).catch(err =>
      fastify.log.error({ err }, 'Error enviando email de reset')
    );

    return reply.send(genericResponse);
  });

  // POST /api/auth/reset-password  (token viene del form en el frontend)
  fastify.post('/api/auth/reset-password', { config: { rateLimit: RATE_TIGHT } }, async (request, reply) => {
    const { token, newPassword } = request.body ?? {};
    if (!token || !newPassword) {
      return reply.code(400).send({ error: 'Token y nueva contraseña son requeridos' });
    }
    if (newPassword.length < 8) {
      return reply.code(400).send({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
      const record = await consumeToken(fastify.prisma, token, 'reset_password');
      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await fastify.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      });
      return { message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      return reply.code(400).send({ error: err.message || 'Token inválido' });
    }
  });

  // POST /api/auth/change-password  (requiere estar autenticado)
  fastify.post('/api/auth/change-password', { preHandler: [fastify.authenticate], config: { rateLimit: RATE_TIGHT } }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body ?? {};
    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ error: 'Contraseña actual y nueva son requeridas' });
    }
    if (newPassword.length < 8) {
      return reply.code(400).send({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: request.currentUser.id } });
    if (!user.password) {
      return reply.code(400).send({ error: 'Tu cuenta usa OAuth. Usa la opción de añadir contraseña.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return reply.code(401).send({ error: 'La contraseña actual es incorrecta' });
    }

    const hashedNew = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const mt = await createMagicToken(fastify.prisma, {
      email: user.email, userId: user.id, type: 'change_password', payload: hashedNew,
    });

    await sendChangePasswordConfirmEmail(user.email, mt.token).catch(err =>
      fastify.log.error({ err }, 'Error enviando email de confirmación de cambio')
    );

    return { message: 'Revisa tu correo para confirmar el cambio de contraseña' };
  });

  // GET /api/auth/confirm-change?token=XXX  — link de confirmación de cambio de contraseña
  fastify.get('/api/auth/confirm-change', { config: { rateLimit: RATE_AUTH } }, async (request, reply) => {
    const { token } = request.query;
    if (!token) return reply.redirect(`${FRONTEND_URL}/profile?msg=invalid_link`);

    try {
      const record = await consumeToken(fastify.prisma, token, 'change_password');
      await fastify.prisma.user.update({
        where: { id: record.userId },
        data: { password: record.payload },
      });
      return reply.redirect(`${FRONTEND_URL}/profile?msg=password_changed`);
    } catch (err) {
      const msg = encodeURIComponent(err.message || 'Error al confirmar cambio');
      return reply.redirect(`${FRONTEND_URL}/profile?msg=${msg}`);
    }
  });
}
