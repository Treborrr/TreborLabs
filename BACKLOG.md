# TREBOR LABS — BACKLOG

> Tareas pendientes ordenadas por prioridad para llegar a producción en Railway.
> Última actualización: 2026-03-25
>
> **Variables de entorno:** todo se configura en Railway dashboard o en `apps/backend/.env` /
> `apps/frontend/.env` localmente. Nada de secrets en la DB ni en el admin UI.
> La única variable del frontend es `VITE_API_URL`. Si en el futuro se implementan
> MercadoPago Bricks, agregar `VITE_MP_PUBLIC_KEY` en Railway como variable de build.

---

## PRIORIDAD ALTA — Bloquean el deploy

### ✅ A3 — Rutas API nuevas (Backend) [COMPLETADO]

~~**A3.1** `apps/backend/src/routes/siteConfig.js`~~
- `GET /api/site-config` — público, retorna JSON con contenido de homepage
- `PUT /api/admin/site-config` — admin only, merge parcial con datos existentes
- Si no existe registro, retornar valores por defecto (los actualmente hardcodeados en Home.jsx)
- Registrar en `index.js`

~~**A3.2** `apps/backend/src/routes/categories.js`~~
- `GET /api/categories` — público, solo `enabled: true`, ordenado por `order`
- `GET /api/admin/categories` — admin, todas
- `POST /api/admin/categories` — validar slug único y formato `[a-z0-9-]`
- `PATCH /api/admin/categories/:id` — editar
- `DELETE /api/admin/categories/:id` — rechazar si hay productos con ese slug
- Registrar en `index.js`

---

### ✅ B2 — CMS: Homepage editable desde admin (Frontend) [COMPLETADO]

~~**B2.1** Hook `useSiteConfig()`~~
- `apps/frontend/src/hooks/useSiteConfig.js`
- Llama a `GET /api/site-config`
- Cachear en `sessionStorage` con TTL 5 minutos
- Retornar `{ config, loading }` con fallback si API falla

~~**B2.2** Refactorizar `Home.jsx`~~
- Reemplazar todo contenido hardcodeado con datos de `useSiteConfig()`
- Skeletons mientras carga
- Productos "destacados": cargar de API con `?featured=true` (no hardcodeados)
- Hero: badge, headline (2 partes), subtítulo, imagen, spec card, CTAs configurables
- About: título, párrafos, imágenes, CTA

~~**B2.3** Crear `apps/frontend/src/views/AdminSiteConfig.jsx`~~
- Ruta: `/admin/site-config`
- Formulario dividido en 3 secciones colapsables: Hero / Destacados / About
- Upload de imágenes con preview (usa `/api/admin/upload`)
- Botón "Guardar cambios" → `PUT /api/admin/site-config`
- Toast éxito/error

---

### ✅ B3 — Categorías dinámicas (Frontend) [COMPLETADO]

~~**B3.1** `apps/frontend/src/views/AdminCategories.jsx`~~
- Ruta: `/admin/categories`
- Tabla CRUD: nombre, slug, ícono, orden, toggle enabled
- "+ Nueva categoría" con panel inline
- Eliminar: bloquear si hay productos con esa categoría

~~**B3.2** Actualizar `AdminProductForm.jsx`~~
- Dropdown de categoría cargado desde `GET /api/categories` (no hardcodeado)

~~**B3.3** Actualizar `ProductCatalog.jsx`~~
- Filtros de categoría desde `GET /api/categories`
- Eliminar lógica hardcodeada `keyboard`/`raspi`

~~**B3.4** Sidebar admin: agregar links a `/admin/categories` y `/admin/site-config`~~

~~**B3.5** `App.jsx`: registrar rutas `AdminCategories` y `AdminSiteConfig`~~

---

### ✅ A5 — Deploy Railway [PARCIAL]

> Variables de entorno a configurar en Railway dashboard (nunca en el repo):
>
> | Variable | Servicio | Nota |
> |---|---|---|
> | `DATABASE_URL` | Backend | Railway la provee automáticamente con su PostgreSQL |
> | `JWT_SECRET` | Backend | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
> | `ADMIN_EMAIL` | Backend | Email del admin inicial |
> | `ADMIN_PASSWORD` | Backend | Contraseña fuerte, cámbiala del default de desarrollo |
> | `FRONTEND_URL` | Backend | URL pública del frontend en Railway |
> | `BACKEND_URL` | Backend | URL pública del backend en Railway |
> | `GOOGLE_CLIENT_ID` | Backend | Rotar antes de publicar |
> | `GOOGLE_CLIENT_SECRET` | Backend | Rotar antes de publicar |
> | `GITHUB_CLIENT_ID` | Backend | Rotar antes de publicar |
> | `GITHUB_CLIENT_SECRET` | Backend | Rotar antes de publicar |
> | `MP_ACCESS_TOKEN` | Backend | Token de producción de MercadoPago |
> | `GMAIL_USER` | Backend | Tu correo Gmail |
> | `GMAIL_APP_PASSWORD` | Backend | App Password de Google (no tu contraseña real) |
> | `NODE_ENV` | Backend | `production` |
> | `VITE_API_URL` | Frontend | URL pública del backend (variable de build en Railway) |
>
> **No existe `VITE_MP_PUBLIC_KEY` por ahora.** Si en el futuro se migra a MercadoPago Bricks
> (formulario embebido en vez de redirect), agregarla como variable de build del frontend en Railway.


~~**A5.1** `railway.json` — Configuración de deploy con healthcheck, start command y restart policy~~

**A5.2** `apps/frontend/railway.json` o `nixpacks.toml`
- Build: `npm run build`
- Start: `npx serve dist -l $PORT`

**A5.3** Verificar `.gitignore` excluye: `.env`, `uploads/`, `node_modules/`

~~**A5.4** Documentar que Railway no tiene disco persistente → `RAILWAY_DEPLOY.md` creado~~

---

## PRIORIDAD MEDIA — Mejoran la experiencia

### ✅ A4 — Robustez y seguridad adicional (Backend) [PARCIAL]

~~**A4.1** `bodyLimit: 1_048_576` al crear la instancia de Fastify (limitar JSON body a 1MB)~~

~~**A4.2** `GET /api/health` → agregar `{ db: "ok"|"error", uptime: seconds }`~~

~~**A4.3** `process.on('unhandledRejection')` y `process.on('uncaughtException')` con log + graceful exit~~

**A4.4** Normalizar email a minúsculas en `POST /api/auth/register`

**A4.5** Índices Prisma en: `Order.status`, `Post.status`, `Post.publishedAt`, `Product.category`

---

### ✅ A6 — Email transaccional [PARCIAL]

**A6.1** Verificar `src/services/email.js` funciona con variables de producción

**A6.2** Email de bienvenida al completar verificación de cuenta

~~**A6.3** Email al admin cuando hay un pedido nuevo (disparado en `POST /api/checkout` exitoso)~~

---

### ✅ A7 — Calidad de API [PARCIAL]

~~**A7.1** `GET /api/products` con `category` inexistente → retornar `[]` (no error)~~

~~**A7.2** `GET /api/posts` soportar filtro `?category=xxx`~~

~~**A7.3** Todos los endpoints paginados: `limit` máximo 100~~

**A7.4** Errores Prisma inesperados: log ERROR + 500 sin exponer stack trace

---

### ✅ B4 — Páginas estáticas / legales (Frontend) [COMPLETADO]

> Estas rutas existen en App.jsx y están completamente implementadas.

~~**B4.1** `About.jsx` — Historia de Trebor Labs, misión, CTA a /contact~~

~~**B4.2** `FAQ.jsx` — Accordion con 8+ preguntas: envíos, pagos, devoluciones, garantía~~

~~**B4.3** `ShippingPolicy.jsx` (`/envios`) — Tabla de zonas, tiempos, tracking~~

~~**B4.4** `ReturnsPolicy.jsx` (`/devoluciones`) — Proceso de devolución, condiciones~~

~~**B4.5** `Terms.jsx` — Términos de servicio~~

~~**B4.6** `Privacy.jsx` — Política de privacidad (LPDP Perú)~~

~~**B4.7** `NotFound.jsx` — Página 404 con estética del proyecto~~

---

### ✅ B5 — UX y flujos incompletos (Frontend) [PARCIAL]

~~**B5.1** `/raspi` → filtrar automáticamente `?category=raspi` al cargar~~

**B5.2** `ProductDetail` — Si usuario no compró: mostrar formulario de reseña deshabilitado con mensaje

~~**B5.3** Checkout con carrito vacío → redirigir a `/products` con mensaje~~

**B5.4** `OrderConfirmation` — Verificar que muestra número de orden, total, next steps

**B5.5** Profile → historial de órdenes carga correctamente con link a `/orders/:id`

~~**B5.6** Navbar mobile — menú hamburguesa se cierra al navegar a otra ruta~~

~~**B5.7** `ErrorBoundary` global en `App.jsx`~~

---

### ✅ B6 — SEO y performance (Frontend) [PARCIAL]

~~**B6.1** `SEOMeta` en páginas que aún no lo tienen: About, FAQ, páginas legales, Contact, Wishlist, Profile, Blog, ProductCatalog~~

~~**B6.2** Blog y BlogPost: `og:image` con imagen del post~~

~~**B6.3** ProductDetail: `og:image` con primera imagen del producto~~

~~**B6.4** `<link rel="canonical">` en `SEOMeta`~~

~~**B6.5** Lazy loading de rutas: `React.lazy` + `Suspense` en `App.jsx` para vistas pesadas~~

**B6.6** Hero image: `loading="eager"`, imágenes about: `loading="lazy"`

---

### ✅ B7 — Mejoras admin menores (Frontend) [PARCIAL]

~~**B7.1** `AdminOrders` — Botón "Exportar CSV" (generado en frontend con datos cargados)~~

**B7.2** `AdminProducts` — Confirmación antes de eliminar producto (modal)

**B7.3** `AdminBlogForm` — Barra de herramientas básica en el editor markdown (negrita, cursiva, link)

**B7.4** `AdminSettings` — Sección "Zona de peligro": cambiar contraseña, limpiar caché site config

---

## PRIORIDAD BAJA — Post-lanzamiento

| Issue | Descripción |
|---|---|
| Storage persistente | Railway no tiene disco → migrar uploads a Cloudinary o S3 |
| Refresh tokens | JWT de 7 días sin rotación. Implementar refresh token |
| Stripe | Segunda gateway para tarjetas internacionales |
| PWA | Service worker + manifest |
| Tests | Vitest (unit) + Playwright (e2e). Sin tests actualmente. |
| WhatsApp button | Botón flotante para soporte en tiempo real |
| Multiidioma | i18n ES/EN con react-i18next |
| Analytics | Google Analytics 4 o Plausible |
| Build guides | Sección /teclados/build-guides del plan original |
| Puntos/Rewards | Sistema de puntos por compra |

---

## Checklist de lanzamiento

### Infraestructura
- [ ] Backend deployado en Railway con health check verde
- [ ] Frontend deployado en Railway / Vercel
- [ ] PostgreSQL en Railway con backups automáticos
- [ ] Dominio configurado con SSL
- [ ] Todas las variables de entorno seteadas

### Funcionalidad crítica
- [ ] Registro + verificación de email funciona en producción
- [ ] OAuth Google + GitHub con redirect URIs de producción
- [ ] Checkout end-to-end: carrito → dirección → cupón → MercadoPago → confirmación
- [ ] Email de confirmación de orden llega
- [ ] Admin puede crear/editar/eliminar productos e imágenes
- [ ] Homepage editable desde admin
- [ ] Categorías gestionables desde admin

### Seguridad
- [ ] `JWT_SECRET` real (≥ 32 chars), no el default de desarrollo
- [ ] CORS solo para el dominio de producción
- [ ] Rate limiting activo
- [ ] `.env` no commiteado al repositorio
- [ ] Credenciales OAuth rotadas (si se usaron en desarrollo)

### SEO y legal
- [ ] `robots.txt` apunta al sitemap correcto
- [ ] `sitemap.xml` retorna URLs de producción
- [ ] Páginas Terms y Privacy con contenido real
- [ ] Todas las páginas con meta title + description únicos
