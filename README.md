# Trebor Labs

E-commerce de teclados mecánicos custom y kits Raspberry Pi, orientado al mercado peruano.
Stack: **React + Vite** (frontend) · **Fastify + Prisma** (backend) · **PostgreSQL** (DB) · **Docker** (dev + prod).

---

## Índice

1. [Estructura del repositorio](#estructura-del-repositorio)
2. [Design system — Circuit Amethyst](#design-system--circuit-amethyst)
3. [Frontend](#frontend)
4. [Backend](#backend)
5. [Base de datos](#base-de-datos)
6. [Autenticación](#autenticación)
7. [Docker — levantar todo](#docker--levantar-todo)
8. [Variables de entorno](#variables-de-entorno)
9. [API reference](#api-reference)
10. [Estado actual y pendientes](#estado-actual-y-pendientes)
11. [Reglas para no romper el diseño](#reglas-para-no-romper-el-diseño)

---

## Estructura del repositorio

```
TreborLabs/
├── apps/
│   ├── backend/                  # Fastify + Prisma
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Modelos User, Account, Session, Order
│   │   ├── src/
│   │   │   ├── plugins/
│   │   │   │   ├── prisma.js     # Decora fastify.prisma
│   │   │   │   └── authenticate.js  # Decora fastify.authenticate / fastify.optionalAuth
│   │   │   ├── routes/
│   │   │   │   ├── auth.js       # OAuth callbacks + /auth/me + /auth/logout
│   │   │   │   └── users.js      # /api/users/me/orders, PATCH /api/users/me, POST /api/orders
│   │   │   └── index.js          # Entry point: registra plugins, OAuth, rutas
│   │   ├── .env.example
│   │   ├── .dockerignore
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/                 # React + Vite + Tailwind CSS v3
│       ├── public/
│       │   └── logo.png          # Logo PNG con fondo transparente (usado para la animación del ring)
│       ├── src/
│       │   ├── context/
│       │   │   ├── AuthContext.jsx   # user, loading, loginWithToken, logout, authFetch
│       │   │   └── CartContext.jsx   # items, count, total, addToCart, removeFromCart, updateQty, clearCart
│       │   ├── components/
│       │   │   └── Navbar.jsx        # Navegación principal con dropdown Tienda, badge carrito, avatar usuario
│       │   ├── views/
│       │   │   ├── Home.jsx
│       │   │   ├── ProductCatalog.jsx  # Maneja /products Y /raspi via useLocation
│       │   │   ├── ProductDetail.jsx
│       │   │   ├── Checkout.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Blog.jsx
│       │   │   ├── Contact.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── AuthCallback.jsx
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminOrders.jsx
│       │   │   ├── AdminBlog.jsx
│       │   │   └── AdminSettings.jsx
│       │   ├── App.jsx             # Router + AuthProvider + CartProvider
│       │   └── index.css           # Design tokens CSS + logo animation
│       ├── .env.example
│       ├── .dockerignore
│       ├── Dockerfile
│       ├── tailwind.config.js      # Paleta Circuit Amethyst completa
│       ├── vite.config.js          # Proxy /api + /auth → backend (Docker)
│       └── package.json
├── docker/
│   └── docker-compose.yml         # postgres + backend + frontend
├── .gitignore
└── README.md
```

---

## Design system — Circuit Amethyst

El diseño fue generado con **Google Stitch** (herramienta de diseño con IA). Es un sistema Material Design 3 dark con paleta amethyst/púrpura. **No cambiar los tokens sin revisar toda la paleta.**

### Colores clave

| Token Tailwind              | Hex       | Uso principal                              |
|-----------------------------|-----------|---------------------------------------------|
| `primary`                   | `#d6baff` | Acentos, CTA buttons, íconos activos        |
| `primary-container`         | `#6b4c9a` | Hover states, fondos de chips               |
| `surface`                   | `#131315` | Fondo base de toda la app                   |
| `surface-container`         | `#201f21` | Cards, paneles                              |
| `surface-container-high`    | `#2a2a2c` | Inputs, items de lista                      |
| `surface-container-highest` | `#353437` | Borders hover, elementos elevados           |
| `on-surface`                | `#e5e1e4` | Texto principal                             |
| `on-surface-variant`        | `#ccc3d1` | Texto secundario, labels, placeholders      |
| `outline-variant`           | `#4a4550` | Borders sutiles                             |
| `error`                     | `#ffb4ab` | Estados de error                            |

### Tipografía

| Clase Tailwind    | Fuente          | Uso                                  |
|-------------------|-----------------|---------------------------------------|
| `font-headline`   | Space Grotesk   | Títulos, botones, labels de nav       |
| `font-body`       | Inter           | Texto de párrafo, descripiciones      |
| `font-mono`       | JetBrains Mono  | Precios, códigos, badges de estado    |

Las tres fuentes se cargan desde Google Fonts en `index.html`.

### Border radius

El sistema usa radios **muy pequeños** (estética "circuit board"):
- Default: `2px` · `lg`: `4px` · `xl`: `8px` · `full`: `12px`

**Nunca usar `rounded-2xl`, `rounded-3xl` o valores más grandes.** Rompe la estética industrial.

### CSS tokens en `:root`

```css
--color-primary: #d6baff;
--color-primary-container: #6b4c9a;
--color-surface: #131315;
```

Estos son los únicos tokens definidos como CSS variables (necesarios para `filter: drop-shadow` y animaciones). El resto viven en `tailwind.config.js`.

### Logo animation (`.logo-ring-base` + `.logo-tracer-ring`)

El logo en la Navbar tiene un efecto de arco luminoso que traza el contorno del PNG:

- **Técnica:** CSS `mask-composite: exclude` con dos capas del mismo PNG (diferente tamaño) crea un anillo que sigue la silueta exacta.
- **Animación:** `@property --logo-angle` (CSS Houdini) anima solo el ángulo del `conic-gradient`, sin rotar el elemento. Así el área de la máscara no se mueve, solo el arco de luz.
- **Velocidad:** 5s linear infinite.
- **Archivos:** `index.css` (clases) + `Navbar.jsx` (estructura HTML).

```jsx
// Estructura correcta en Navbar.jsx — NO modificar el orden de los divs
<div className="relative w-9 h-9 ...">
  <img src="/logo.png" ... />
  <div className="logo-ring-base" aria-hidden="true" />
  <div className="logo-tracer-ring" aria-hidden="true" />
</div>
```

---

## Frontend

- **React 19** + **React Router 7** + **Vite 8**
- **Tailwind CSS v3** (configurado via `postcss.config.js`, NO v4 Vite plugin)

### Rutas

| Path                | Componente        | Navbar visible | Notas                                      |
|---------------------|-------------------|----------------|--------------------------------------------|
| `/`                 | `Home`            | ✅              |                                            |
| `/products`         | `ProductCatalog`  | ✅              | Teclados custom                            |
| `/products/:id`     | `ProductDetail`   | ✅              |                                            |
| `/raspi`            | `ProductCatalog`  | ✅              | **Mismo componente**, detecta ruta con `useLocation` |
| `/blog`             | `Blog`            | ✅              |                                            |
| `/contact`          | `Contact`         | ✅              |                                            |
| `/checkout`         | `Checkout`        | ✅              |                                            |
| `/profile`          | `Profile`         | ✅              | Requiere login (redirige si no hay token)  |
| `/login`            | `Login`           | ❌              | OAuth buttons Google + GitHub              |
| `/auth/callback`    | `AuthCallback`    | ❌              | Landing post-OAuth, extrae `?token=`       |
| `/admin`            | `AdminDashboard`  | ❌              |                                            |
| `/admin/orders`     | `AdminOrders`     | ❌              |                                            |
| `/admin/blog`       | `AdminBlog`       | ❌              |                                            |
| `/admin-settings`   | `AdminSettings`   | ❌              |                                            |

### ProductCatalog — patrón dual-route

`/products` y `/raspi` apuntan al **mismo componente**. La diferencia es detectada con:

```jsx
const isRaspi = location.pathname.includes('raspi');
```

El sidebar renderiza filtros diferentes según `isRaspi`. Los productos del catálogo tienen `category: 'keyboards'` o `category: 'raspi'` y se filtran por esa propiedad.

### Contextos

**`AuthContext`** — gestión de sesión JWT:
```js
const { user, loading, loginWithToken, logout, authFetch } = useAuth();
// user: { id, email, name, avatar } | null
// authFetch(url, options): fetch con Authorization header automático
```

**`CartContext`** — carrito de compras:
```js
const { items, count, total, addToCart, removeFromCart, updateQty, clearCart } = useCart();
// addToCart(product): product debe tener { id, name, price }
```

### URLs del backend en el frontend

```js
// En AuthContext.jsx y Login.jsx:
const API = import.meta.env.VITE_API_URL ?? '';
```

- **En Docker:** `VITE_API_URL=""` → rutas relativas (`/auth/me`, `/api/...`) → el Vite proxy las redirige al contenedor backend internamente. El usuario no necesita configurar ninguna IP.
- **En desarrollo local (sin Docker):** `VITE_API_URL=http://localhost:3001` → peticiones directas al backend.

**Regla:** siempre usar `??` (nullish coalescing), nunca `||`, porque `'' || fallback` ignora el string vacío.

### Proxy de Vite (vite.config.js)

```js
server: {
  host: true,        // Bind a 0.0.0.0 para Docker
  port: 5173,
  proxy: {
    '/api':  { target: 'http://backend:3001', changeOrigin: true },
    '/auth': { target: 'http://backend:3001', changeOrigin: true },
  },
}
```

El proxy solo funciona en desarrollo. En producción se necesita Nginx o similar.

---

## Backend

- **Fastify v5** (ESM, `"type": "module"`)
- **Prisma v6** como ORM
- **pino-pretty** para logs legibles en desarrollo

### Entry point: `src/index.js`

Orden de registro de plugins (el orden importa en Fastify):
1. `@fastify/cors` — origin: `FRONTEND_URL`
2. `@fastify/cookie`
3. `@fastify/jwt` — secret: `JWT_SECRET`
4. `prismaPlugin` — decora `fastify.prisma`
5. `fastifyOauth2` (Google) — rutas `/auth/google` y `/auth/google/callback`
6. `fastifyOauth2` (GitHub) — rutas `/auth/github` y `/auth/github/callback`
7. `authenticatePlugin` — decora `fastify.authenticate` y `fastify.optionalAuth`
8. `authRoutes`
9. `userRoutes`

### Plugins

**`src/plugins/prisma.js`** — registra el cliente Prisma y lo cierra al apagar el servidor:
```js
fastify.decorate('prisma', prisma);
```

**`src/plugins/authenticate.js`** — dos decoradores:
- `fastify.authenticate`: requiere JWT válido, falla con 401 si no hay token.
- `fastify.optionalAuth`: verifica JWT si existe, no falla si no hay token. Util para pedidos de invitados.

Ambos buscan el usuario en DB y lo adjuntan a `request.currentUser`.

### Scripts npm

```bash
npm run dev          # Node --watch (hot reload nativo)
npm run start        # Producción
npm run db:push      # Sincronizar schema con DB (sin migraciones)
npm run db:migrate   # Crear migración con nombre
npm run db:studio    # Prisma Studio en el browser
npm run db:generate  # Regenerar cliente Prisma
```

---

## Base de datos

PostgreSQL 16. Schema en `apps/backend/prisma/schema.prisma`.

### Modelos

**`User`**
```
id        String   @id @default(cuid())
email     String   @unique
name      String?
avatar    String?
createdAt DateTime
updatedAt DateTime
```

**`Account`** — vincula un User con su proveedor OAuth:
```
provider          String  // "google" | "github"
providerAccountId String  // ID del user en el proveedor
@@unique([provider, providerAccountId])
```
Un usuario puede tener múltiples cuentas vinculadas (Google + GitHub → mismo email → mismo User).

**`Session`** — tokens de sesión (para futuras invalidaciones):
```
token     String @unique @default(cuid())
expiresAt DateTime
```

**`Order`**:
```
userId  String?   // null si compra como invitado
items   Json      // Array de { id, name, price, qty }
total   Float
status  String    // pending | processing | shipped | delivered | cancelled
address Json?
```

### Flujo de sincronización

En desarrollo (Docker), el backend corre `prisma db push` al arrancar:
```
CMD: npx prisma generate && npx prisma db push && node --watch src/index.js
```
Esto aplica el schema directamente sin crear archivos de migración. Cambiar a `prisma migrate dev` para producción.

---

## Autenticación

### Flujo OAuth completo

```
1. Usuario hace click en "Continuar con Google"
2. Frontend: window.location.href = '/auth/google'
   (En Docker: Vite proxy lo redirige a http://backend:3001/auth/google)
3. Backend: redirige a Google con redirect_uri = BACKEND_URL/auth/google/callback
4. Google autentica al usuario y redirige a BACKEND_URL/auth/google/callback
5. Backend: obtiene perfil, llama findOrCreateUser(), genera JWT (7 días)
6. Backend: redirige a FRONTEND_URL/auth/callback?token=<jwt>
7. AuthCallback.jsx: lee ?token=, llama loginWithToken(), redirige a /profile
```

### `findOrCreateUser`

Lógica de deduplicación:
1. Busca por `(provider, providerAccountId)` — mismo proveedor, mismo ID externo
2. Si no existe la Account: busca User por email y vincula la nueva Account
3. Si no existe el User: crea User + Account juntos

Esto permite que si el mismo email está en Google y GitHub, ambas cuentas se vinculen al mismo User.

### JWT

- Payload: `{ userId: string }`
- Duración: 7 días
- Transporte: `Authorization: Bearer <token>` header
- Almacenamiento en cliente: `localStorage` key `trebor_token`

### Variables de OAuth

Para registrar los OAuth apps se necesitan las URLs de callback:
- Google: `http://<homeserver-ip>:3001/auth/google/callback`
- GitHub: `http://<homeserver-ip>:3001/auth/github/callback`

Homepage URL (GitHub): `http://<homeserver-ip>:5173`

---

## Docker — levantar todo

### Requisitos

- Docker + Docker Compose instalados en el homeserver
- Archivos `.env` creados (ver sección siguiente)

### Primer arranque

```bash
# 1. Rellenar variables de entorno
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Editar apps/backend/.env con las credenciales reales

# 2. Construir y levantar
cd docker
docker compose up --build

# La primera vez: backend corre prisma db push automáticamente
# Frontend disponible en http://homeserver-ip:5173
# Backend disponible en http://homeserver-ip:3001
```

### Arranques posteriores

```bash
docker compose up
```

### Hot reload

El código fuente está montado como volúmenes:
- Backend: `src/` y `prisma/` — cambios visibles inmediatamente (Node --watch)
- Frontend: `src/`, `public/`, `index.html` — Vite HMR activo

Los archivos de configuración (`vite.config.js`, `package.json`, etc.) **no** están montados. Si se modifican, hay que reconstruir la imagen:
```bash
docker compose up --build
```

### Servicios y puertos

| Servicio   | Puerto externo | Container name       |
|------------|----------------|----------------------|
| PostgreSQL | no expuesto    | `treborlabs_db`      |
| Backend    | `3001`         | `treborlabs_backend` |
| Frontend   | `5173`         | `treborlabs_frontend`|

---

## Variables de entorno

### `apps/backend/.env`

```env
DATABASE_URL=postgresql://trebor:trebor_secret@localhost:5432/treborlabs
PORT=3001
BACKEND_URL=http://<homeserver-ip>:3001
FRONTEND_URL=http://<homeserver-ip>:5173
JWT_SECRET=<string aleatorio largo, ej: openssl rand -hex 32>

GOOGLE_CLIENT_ID=<desde Google Cloud Console>
GOOGLE_CLIENT_SECRET=<desde Google Cloud Console>

GITHUB_CLIENT_ID=<desde GitHub Settings → Developer applications>
GITHUB_CLIENT_SECRET=<desde GitHub Settings → Developer applications>
```

> **Nota:** `DATABASE_URL` en `.env` usa `localhost`. Docker Compose sobrescribe esto con `DATABASE_URL=postgresql://trebor:trebor_secret@postgres:5432/treborlabs` (hostname del servicio interno).

### `apps/frontend/.env`

```env
VITE_API_URL=http://localhost:3001
```

> En Docker, `docker-compose.yml` sobrescribe esto con `VITE_API_URL=""` para usar el proxy de Vite.

---

## API reference

### Auth

| Método | Path                       | Auth     | Descripción                                      |
|--------|----------------------------|----------|--------------------------------------------------|
| GET    | `/auth/google`             | No       | Inicia OAuth con Google (redirect)               |
| GET    | `/auth/google/callback`    | No       | Callback de Google, genera JWT, redirect frontend|
| GET    | `/auth/github`             | No       | Inicia OAuth con GitHub (redirect)               |
| GET    | `/auth/github/callback`    | No       | Callback de GitHub, genera JWT, redirect frontend|
| GET    | `/auth/me`                 | Requerida| Devuelve `{ user }` del token actual             |
| POST   | `/auth/logout`             | Requerida| Responde `{ ok: true }` (cliente elimina token)  |

### Usuarios y pedidos

| Método | Path                       | Auth     | Descripción                          |
|--------|----------------------------|----------|--------------------------------------|
| GET    | `/api/users/me/orders`     | Requerida| Pedidos del usuario autenticado      |
| PATCH  | `/api/users/me`            | Requerida| Actualizar `name` y/o `avatar`       |
| POST   | `/api/orders`              | Opcional | Crear pedido (funciona sin login)    |

### Health check

| Método | Path           | Auth | Respuesta                                    |
|--------|----------------|------|----------------------------------------------|
| GET    | `/api/health`  | No   | `{ status: "ok", version, timestamp }`       |

### Autenticación en peticiones

```http
Authorization: Bearer <jwt_token>
```

Usar `authFetch` del `AuthContext` para incluirlo automáticamente:
```js
const { authFetch } = useAuth();
const res = await authFetch('/api/users/me/orders');
```

---

## Estado actual y pendientes

### Completado

- [x] Design system Circuit Amethyst en Tailwind
- [x] Logo animation con CSS Houdini (`@property --logo-angle`)
- [x] Navbar con dropdown Tienda, badge carrito, avatar usuario
- [x] Todas las vistas del frontend (14 views)
- [x] ProductCatalog unificado para `/products` y `/raspi`
- [x] CartContext global
- [x] AuthContext con JWT
- [x] Backend Fastify con OAuth Google + GitHub
- [x] Prisma schema (User, Account, Session, Order)
- [x] Docker Compose con hot reload para los 3 servicios
- [x] Proxy Vite para Docker (sin necesidad de configurar IPs)
- [x] `.gitignore` + README

### Pendientes / próximos pasos

- [ ] **Conectar ProductCatalog con API** — productos hardcodeados actualmente en el frontend; crear modelo `Product` en Prisma y endpoint `GET /api/products`
- [ ] **Checkout funcional** — conectar `POST /api/orders` desde `Checkout.jsx`; el carrito se limpia y se guarda el pedido
- [ ] **Perfil de usuario** — conectar `Profile.jsx` con `GET /api/users/me/orders` y `PATCH /api/users/me`
- [ ] **Admin protección** — las rutas `/admin*` no tienen guard; agregar verificación de rol `admin` en el backend y redirect si no es admin
- [ ] **Modelo Product en Prisma** — para gestionar catálogo desde el admin
- [ ] **AdminBlog con persistencia** — actualmente es UI sin backend; crear modelo `Post`
- [ ] **Imágenes de productos** — definir estrategia (S3, local, Cloudinary)
- [ ] **Configuración de producción** — Nginx reverse proxy, HTTPS, `prisma migrate deploy` en vez de `db push`

---

## Reglas para no romper el diseño

Estas reglas deben respetarse en cualquier contribución futura:

### 1. Nunca usar colores fuera del sistema

```jsx
// MAL — hardcoded
<div className="bg-purple-900 text-white">

// BIEN — token del sistema
<div className="bg-primary-container text-on-primary-container">
```

### 2. Nunca usar border-radius grande

```jsx
// MAL — rompe la estética "circuit board"
<div className="rounded-2xl rounded-3xl rounded-full">

// BIEN
<div className="rounded rounded-lg rounded-xl">
// máximo: rounded-xl (8px)
```

### 3. Tipografía por rol, no por tamaño arbitrario

```jsx
// Títulos/botones/nav → font-headline (Space Grotesk)
<h2 className="font-headline font-black tracking-tighter">

// Texto general → font-body (Inter), aunque es el default
<p className="font-body">

// Precios/códigos/badges → font-mono (JetBrains Mono)
<span className="font-mono text-xs tracking-widest">
```

### 4. Las vistas admin no tienen Navbar

`App.jsx` oculta la Navbar para cualquier path que empiece con `/admin`, más `/login` y `/auth/callback`. Si se agregan más rutas sin Navbar, agregar la condición ahí.

### 5. ProductCatalog es el único componente de catálogo

`RaspiCatalog.jsx` existe como archivo pero **no está en uso** (no está en ninguna ruta de `App.jsx`). No confundirse. Toda la lógica de catálogo (keyboards y raspi) vive en `ProductCatalog.jsx`.

### 6. El proxy de Vite solo funciona en dev

Si se construye para producción (`vite build`), el proxy no existe. En producción se necesita un servidor web (Nginx) que redirija `/api` y `/auth` al backend.

### 7. JWT se transporta solo en header, no en cookies

La implementación actual usa `localStorage` + `Authorization: Bearer`. No cambiar a cookies sin actualizar `authenticate.js`, el CORS config y el frontend.

### 8. `VITE_API_URL ?? ''` — nunca `||`

El string vacío `''` es falsy en JS. `'' || 'http://localhost:3001'` ignora el empty string del Docker override. Usar siempre `??`.
