import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyOauth2 from '@fastify/oauth2';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyHelmet from '@fastify/helmet';
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
import cartRoutes from './routes/cart.js';
import shippingRoutes from './routes/shipping.js';
import couponRoutes from './routes/coupons.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhooks.js';
import commentRoutes from './routes/comments.js';
import wishlistRoutes from './routes/wishlist.js';
import adminUsersRoutes from './routes/adminUsers.js';
import referralRoutes from './routes/referrals.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';

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

const isProd = process.env.NODE_ENV === 'production';

await fastify.register(fastifyRateLimit, {
  global: true,
  max:        isProd ? 120 : 300,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({ error: 'Demasiadas solicitudes. Espera un momento.' }),
});

// ─── Plugins base ───────────────────────────────────────────────────────────

await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Manejado por el CDN/proxy en Railway
  crossOriginEmbedderPolicy: false,
});

await fastify.register(fastifyCors, {
  origin:      isProd ? [FRONTEND_URL] : true,
  credentials: true,
});

await fastify.register(fastifyCookie);

const jwtSecret = process.env.JWT_SECRET;
if (isProd && !jwtSecret) {
  fastify.log.error('JWT_SECRET no está definido en producción. Abortando.');
  process.exit(1);
}
await fastify.register(fastifyJwt, {
  secret: jwtSecret || 'dev_secret_change_in_production',
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
await fastify.register(cartRoutes);
await fastify.register(shippingRoutes);
await fastify.register(couponRoutes);
await fastify.register(checkoutRoutes);
await fastify.register(webhookRoutes);
await fastify.register(commentRoutes);
await fastify.register(wishlistRoutes);
await fastify.register(adminUsersRoutes);
await fastify.register(referralRoutes);
await fastify.register(notificationRoutes);
await fastify.register(analyticsRoutes);

// Health check
fastify.get('/api/health', async () => ({
  status: 'ok',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ─── Upload de imágenes ──────────────────────────────────────────────────────

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

fastify.post('/api/admin/upload', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
  const data = await request.file({ limits: { fileSize: MAX_FILE_SIZE } });
  if (!data) return reply.code(400).send({ error: 'No se recibió ningún archivo' });

  if (!ALLOWED_MIME.has(data.mimetype)) {
    data.file.resume(); // drain stream
    return reply.code(400).send({ error: 'Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, WebP, GIF, AVIF).' });
  }

  const ext = data.mimetype.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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

// ─── Admin: Orders (list) ─────────────────────────────────────────────────────

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
// PATCH /api/admin/orders/:id → adminUsers.js

// ─── M7: robots.txt ──────────────────────────────────────────────────────────

fastify.get('/robots.txt', async (_, reply) => {
  reply.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${BACKEND_URL}/sitemap.xml\n`
  );
});

// ─── M7: sitemap.xml ─────────────────────────────────────────────────────────

fastify.get('/sitemap.xml', async (_, reply) => {
  const [products, posts] = await Promise.all([
    fastify.prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    fastify.prisma.post.findMany({
      where:  { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = ['', '/products', '/blog', '/about', '/faq', '/envios', '/devoluciones', '/terminos', '/privacidad'];

  const urlTag = (loc, lastmod) =>
    `<url><loc>${FRONTEND_URL}${loc}</loc><lastmod>${lastmod?.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10)}</lastmod></url>`;

  const urls = [
    ...staticPages.map(p => urlTag(p, null)),
    ...products.map(p => urlTag(`/products/${p.slug}`, p.updatedAt)),
    ...posts.map(p => urlTag(`/blog/${p.slug}`, p.updatedAt)),
  ].join('\n  ');

  reply.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls}\n</urlset>`
  );
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

// ─── Seed: zonas de envío por defecto ────────────────────────────────────────

async function seedShippingZones() {
  const count = await fastify.prisma.shippingZone.count();
  if (count > 0) return;

  const zones = [
    {
      name:    'Lima Metropolitana',
      regions: ['Lima'],
      price:   10,
      enabled: true,
    },
    {
      name: 'Resto del Perú',
      regions: [
        'Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca',
        'Callao','Cusco','Huancavelica','Huánuco','Ica','Junín',
        'La Libertad','Lambayeque','Loreto','Madre de Dios','Moquegua',
        'Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali',
      ],
      price:   18,
      enabled: true,
    },
    {
      name:    'Lima Provincias',
      regions: ['Lima Provincias'],
      price:   15,
      enabled: true,
    },
  ];

  await fastify.prisma.shippingZone.createMany({ data: zones });
  fastify.log.info('Zonas de envío por defecto creadas');
}

// ─── Seed: categorías por defecto ────────────────────────────────────────────

async function seedCategories() {
  const count = await fastify.prisma.category.count();
  if (count > 0) return;

  await fastify.prisma.category.createMany({
    data: [
      { slug: 'keyboard', name: 'Teclados Custom',  icon: 'keyboard', order: 1, enabled: true },
      { slug: 'raspi',    name: 'Raspberry Pi',     icon: 'memory',   order: 2, enabled: true },
    ],
  });
  fastify.log.info('Categorías por defecto creadas');
}

await seedShippingZones();
await seedCategories();
