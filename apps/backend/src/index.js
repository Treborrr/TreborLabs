import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyOauth2 from '@fastify/oauth2';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import { pipeline } from 'stream/promises';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

import prismaPlugin from './plugins/prisma.js';
import authenticatePlugin from './plugins/authenticate.js';
import requireAdminPlugin from './plugins/requireAdmin.js';
import authRoutes from './routes/auth.js';
import authEmailRoutes from './routes/authEmail.js';
import userRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import postsRoutes from './routes/posts.js';

const PORT = parseInt(process.env.PORT || '3001');
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
mkdirSync(UPLOADS_DIR, { recursive: true });

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss' },
    },
  },
});

// ─── Rate limiting ───────────────────────────────────────────────────────────

await fastify.register(fastifyRateLimit, {
  global: true,
  max: 300,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({ error: 'Demasiadas solicitudes. Espera un momento.' }),
});

// ─── Plugins base ───────────────────────────────────────────────────────────

await fastify.register(fastifyCors, {
  origin: FRONTEND_URL,
  credentials: true,
});

await fastify.register(fastifyCookie);

await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
});

// ─── DB ─────────────────────────────────────────────────────────────────────

await fastify.register(prismaPlugin);

// ─── OAuth: Google ───────────────────────────────────────────────────────────

await fastify.register(fastifyOauth2, {
  name: 'googleOAuth2',
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  scope: ['openid', 'profile', 'email'],
  startRedirectPath: '/auth/google',
  callbackUri: `${BACKEND_URL}/auth/google/callback`,
  callbackUriParams: {
    access_type: 'online',
  },
});

// ─── OAuth: GitHub ───────────────────────────────────────────────────────────

await fastify.register(fastifyOauth2, {
  name: 'githubOAuth2',
  credentials: {
    client: {
      id: process.env.GITHUB_CLIENT_ID,
      secret: process.env.GITHUB_CLIENT_SECRET,
    },
    auth: fastifyOauth2.GITHUB_CONFIGURATION,
  },
  scope: ['user:email'],
  startRedirectPath: '/auth/github',
  callbackUri: `${BACKEND_URL}/auth/github/callback`,
});

// ─── Multipart (file uploads) ────────────────────────────────────────────────

await fastify.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Static files (serve uploads) ───────────────────────────────────────────

await fastify.register(fastifyStatic, {
  root: UPLOADS_DIR,
  prefix: '/uploads/',
});

// ─── Auth middleware decorators ──────────────────────────────────────────────

await fastify.register(authenticatePlugin);
await fastify.register(requireAdminPlugin);

// ─── Rutas ───────────────────────────────────────────────────────────────────

await fastify.register(authRoutes);
await fastify.register(authEmailRoutes);
await fastify.register(userRoutes);
await fastify.register(productsRoutes);
await fastify.register(postsRoutes);

// Health check
fastify.get('/api/health', async () => ({
  status: 'ok',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ─── Upload de imágenes ──────────────────────────────────────────────────────

fastify.post('/api/admin/upload', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
  const data = await request.file();
  if (!data) return reply.code(400).send({ error: 'No se recibió ningún archivo' });

  const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const dest = join(UPLOADS_DIR, filename);

  await pipeline(data.file, createWriteStream(dest));

  return { url: `/uploads/${filename}` };
});

// ─── Admin: Stats ─────────────────────────────────────────────────────────────

fastify.get('/api/admin/stats', { preHandler: [fastify.requireAdmin] }, async () => {
  const [totalOrders, revenueAgg, totalProducts, totalPosts, pendingOrders, stockAlerts] =
    await fastify.prisma.$transaction([
      fastify.prisma.order.count(),
      fastify.prisma.order.aggregate({ _sum: { total: true } }),
      fastify.prisma.product.count(),
      fastify.prisma.post.count(),
      fastify.prisma.order.count({ where: { status: 'pending' } }),
      fastify.prisma.product.findMany({
        where: { stock: { lt: 5 } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: revenueAgg._sum.total || 0,
    totalProducts,
    totalPosts,
    pendingOrders,
    stockAlerts,
  };
});

// ─── Admin: Orders ────────────────────────────────────────────────────────────

fastify.get('/api/admin/orders', { preHandler: [fastify.requireAdmin] }, async (request) => {
  const { limit = '10', offset = '0', status } = request.query;
  const where = status ? { status } : {};

  const [orders, total] = await fastify.prisma.$transaction([
    fastify.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    fastify.prisma.order.count({ where }),
  ]);

  return { orders, total };
});

// ─── Start ───────────────────────────────────────────────────────────────────

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  fastify.log.info(`Backend escuchando en ${BACKEND_URL}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// ─── Seed: admin user from .env ──────────────────────────────────────────────

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const exists = await fastify.prisma.user.findUnique({ where: { email: adminEmail } });
  if (exists) {
    if (exists.role !== 'ADMIN') {
      await fastify.prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
      fastify.log.info(`Usuario ${adminEmail} promovido a ADMIN`);
    }
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  await fastify.prisma.user.create({
    data: { email: adminEmail, name: 'Admin', password: hashed, role: 'ADMIN', emailVerified: true },
  });
  fastify.log.info(`Admin creado: ${adminEmail}`);
}

await ensureAdminUser();
