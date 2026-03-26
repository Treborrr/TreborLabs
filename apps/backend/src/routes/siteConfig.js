const defaultSiteConfig = {
  hero: {
    badge: "EDICIÓN LIMITADA",
    headlinePart1: "Construyendo el",
    headlinePart2: "Teclado Perfecto",
    subtitle: "Diseñados para los entusiastas del sonido, estética y rendimiento absoluto.",
    ctaPrimary: "Ver Teclados",
    ctaPrimaryLink: "/products?category=keyboard",
    ctaSecondary: "Raspberry Pi",
    ctaSecondaryLink: "/products?category=raspi",
    image: null,
    background: {
      type: 'preset',
      preset: 'amethyst-bloom',
      url: null
    },
    specCard: {
      switches: "Gateron Milky Yellow Pro",
      keycaps: "PBT Double Shot"
    }
  },
  about: {
    title: "Innovación y Precisión",
    paragraphs: [
      "En Trebor Labs, no solo vendemos componentes; creamos herramientas exactas para aquellos que no se conforman. Desde teclados mecánicos customizados hasta placas Raspberry Pi preparadas para cualquier proyecto.",
      "Cada componente es probado y verificado. Enviamos a todo el país garantizando la calidad que exiges."
    ],
    cta: "Nuestra Historia",
    ctaLink: "/about",
    images: []
  },
  footer: {
    tagline: "Teclados custom & Raspberry Pi para makers y enthusiasts."
  }
};

export default async function siteConfigRoutes(fastify, options) {
  // GET /api/site-config - Público
  fastify.get('/api/site-config', async (request, reply) => {
    try {
      const config = await fastify.prisma.siteConfig.findUnique({
        where: { id: 'main' }
      });

      if (!config) {
        return { data: defaultSiteConfig };
      }

      return { data: config.data };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error fetching site config' });
    }
  });

  // PUT /api/admin/site-config - Admin Only
  fastify.put(
    '/api/admin/site-config',
    { preValidation: [fastify.authenticate, fastify.requireAdmin] },
    async (request, reply) => {
      try {
        const payload = request.body;

        // Get current config to merge
        let currentConfig = await fastify.prisma.siteConfig.findUnique({
          where: { id: 'main' }
        });

        const currentData = currentConfig ? currentConfig.data : defaultSiteConfig;

        // Deep merge or replace
        const newData = {
          ...currentData,
          ...payload
        };

        const updatedConfig = await fastify.prisma.siteConfig.upsert({
          where: { id: 'main' },
          update: { data: newData },
          create: { id: 'main', data: newData }
        });

        return { data: updatedConfig.data };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error updating site config' });
      }
    }
  );
}
