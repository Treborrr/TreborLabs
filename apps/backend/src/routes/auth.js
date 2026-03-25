// Rutas de autenticación OAuth (Google + GitHub) y gestión de sesión

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper: busca o crea el usuario a partir del perfil OAuth
async function findOrCreateUser(prisma, { provider, providerAccountId, email, name, avatar }) {
  // 1. Buscar si ya existe la account (mismo provider + mismo ID externo)
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
  if (existingAccount) return existingAccount.user;

  // 2. Buscar usuario por email y vincular la nueva account
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.account.create({
      data: { userId: existingUser.id, provider, providerAccountId },
    });
    return existingUser;
  }

  // 3. Crear usuario nuevo
  return prisma.user.create({
    data: {
      email,
      name,
      avatar,
      accounts: { create: { provider, providerAccountId } },
    },
  });
}

// Helper: genera JWT y redirige al frontend
function redirectWithToken(fastify, reply, user) {
  const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '7d' });
  reply.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
}

async function authRoutes(fastify) {
  // ─── Google callback ──────────────────────────────────────────────────────
  fastify.get('/auth/google/callback', async (request, reply) => {
    try {
      const { token } =
        await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, reply);

      // Obtener perfil del usuario desde Google
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      const profile = await res.json();

      const user = await findOrCreateUser(fastify.prisma, {
        provider: 'google',
        providerAccountId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
      });

      return redirectWithToken(fastify, reply, user);
    } catch (err) {
      fastify.log.error(err);
      reply.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    }
  });

  // ─── GitHub callback ──────────────────────────────────────────────────────
  fastify.get('/auth/github/callback', async (request, reply) => {
    try {
      const { token } =
        await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, reply);

      // Obtener perfil
      const [userRes, emailsRes] = await Promise.all([
        fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'TreborLabs' },
        }),
        fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'TreborLabs' },
        }),
      ]);

      const profile = await userRes.json();
      const emails = await emailsRes.json();

      // GitHub puede no exponer el email directamente; tomamos el primario verificado
      const primaryEmail =
        profile.email ||
        (Array.isArray(emails) && emails.find(e => e.primary && e.verified)?.email);

      if (!primaryEmail) {
        return reply.redirect(`${FRONTEND_URL}/login?error=no_email`);
      }

      const user = await findOrCreateUser(fastify.prisma, {
        provider: 'github',
        providerAccountId: String(profile.id),
        email: primaryEmail,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
      });

      return redirectWithToken(fastify, reply, user);
    } catch (err) {
      fastify.log.error(err);
      reply.redirect(`${FRONTEND_URL}/login?error=github_failed`);
    }
  });

  // ─── GET /auth/me — perfil del usuario autenticado ───────────────────────
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request) => {
    return { user: request.currentUser };
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────
  fastify.post('/auth/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    // El JWT es stateless, solo comunicamos al cliente que lo elimine.
    // Opcionalmente se puede registrar una blacklist con Sessions.
    return reply.send({ ok: true });
  });
}

export default authRoutes;
