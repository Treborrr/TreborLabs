import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyOauth2 from '@fastify/oauth2';

import prismaPlugin from './plugins/prisma.js';
import authenticatePlugin from './plugins/authenticate.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const PORT = parseInt(process.env.PORT || '3001');
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss' },
    },
  },
});

// ─── Plugins base ───────────────────────────────────────────────────────────

await fastify.register(fastifyCors, {
  origin: FRONTEND_URL,
  credentials: true,
});

await fastify.register(fastifyCookie);

await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  // El JWT puede viajar como Bearer token en Authorization header
  // o como cookie httpOnly (más seguro en producción)
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

// ─── Auth middleware decorator ───────────────────────────────────────────────

await fastify.register(authenticatePlugin);

// ─── Rutas ───────────────────────────────────────────────────────────────────

await fastify.register(authRoutes);
await fastify.register(userRoutes);

// Health check
fastify.get('/api/health', async () => ({
  status: 'ok',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ─── Start ───────────────────────────────────────────────────────────────────

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  fastify.log.info(`Backend escuchando en ${BACKEND_URL}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
