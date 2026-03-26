export default async function categoriesRoutes(fastify, options) {
  // GET /api/categories - Público (solo enabled: true)
  fastify.get('/api/categories', async (request, reply) => {
    try {
      const categories = await fastify.prisma.category.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' }
      });
      return categories;
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error fetching categories' });
    }
  });

  // GET /api/admin/categories - Admin (todas)
  fastify.get(
    '/api/admin/categories',
    { preValidation: [fastify.authenticate, fastify.requireAdmin] },
    async (request, reply) => {
      try {
        const categories = await fastify.prisma.category.findMany({
          orderBy: { order: 'asc' }
        });
        return categories;
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error fetching categories' });
      }
    }
  );

  // POST /api/admin/categories - Admin
  fastify.post(
    '/api/admin/categories',
    {
      preValidation: [fastify.authenticate, fastify.requireAdmin],
      schema: {
        body: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            name: { type: 'string', minLength: 1 },
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
            icon: { type: 'string' },
            enabled: { type: 'boolean' },
            order: { type: 'integer' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { name, slug, icon, enabled, order } = request.body;

        // Validar unique slug
        const existing = await fastify.prisma.category.findUnique({ where: { slug } });
        if (existing) {
          return reply.status(400).send({ error: 'Slug ya existe' });
        }

        const category = await fastify.prisma.category.create({
          data: {
            name,
            slug,
            icon,
            enabled: enabled !== undefined ? enabled : true,
            order: order || 0
          }
        });
        return category;
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error creating category' });
      }
    }
  );

  // PATCH /api/admin/categories/:id - Admin
  fastify.patch(
    '/api/admin/categories/:id',
    {
      preValidation: [fastify.authenticate, fastify.requireAdmin],
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
            icon: { type: 'string' },
            enabled: { type: 'boolean' },
            order: { type: 'integer' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const data = request.body;

        if (data.slug) {
          const existing = await fastify.prisma.category.findFirst({
            where: { slug: data.slug, id: { not: id } }
          });
          if (existing) {
            return reply.status(400).send({ error: 'Slug ya existe en otra categoría' });
          }
        }

        const category = await fastify.prisma.category.update({
          where: { id },
          data
        });
        return category;
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ error: 'Category not found' });
        }
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error updating category' });
      }
    }
  );

  // DELETE /api/admin/categories/:id - Admin
  fastify.delete(
    '/api/admin/categories/:id',
    { preValidation: [fastify.authenticate, fastify.requireAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const category = await fastify.prisma.category.findUnique({ where: { id } });
        if (!category) {
          return reply.status(404).send({ error: 'Category not found' });
        }

        // Check if there are products with this category's slug
        const productsCount = await fastify.prisma.product.count({
          where: { category: category.slug }
        });

        if (productsCount > 0) {
          return reply.status(400).send({ error: 'Cannot delete category in use by products' });
        }

        await fastify.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted successfully' };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error deleting category' });
      }
    }
  );
}
