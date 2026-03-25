# 📋 TREBOR LABS - PLAN MAESTRO COMPLETO

## 🎯 RESUMEN EJECUTIVO

**Proyecto:** Trebor Labs - Plataforma de hardware gaming (teclados split, Raspi, blog)
**Fundador:** Robert Alvarado (Trebor = Robert al revés)
**Mercado:** Gamers competitivos (18-35 años) en Perú
**Modelo:** Vitrina + Contacto directo + Blog light
**Tech Stack:** Next.js + React + Tailwind CSS
**Lanzamiento:** 6-8 semanas (MVP)

---

## 🎨 IDENTIDAD DE MARCA

### Logo
- **Keycap púrpura** (#6B4C9A) con **punto y coma (;)** blanco
- Representa: fin de instrucción en código (hardware + software)
- Versiones: completa + ícono + monocromática

### Tagline
**"Tu próximo gran proyecto empieza aquí"**

### Valores Centrales
- Innovación + Accesibilidad
- Hardware profesional con precios justos
- Comunidad de makers/gamers

### Paleta de Colores (Núcleo - Consistente en todo)
- **Púrpura Primario:** #6B4C9A (logo, headings, CTAs)
- **Púrpura Secundario:** #9D7BC4 (acentos, textos secundarios)
- **Blanco/Cream:** #FAFAF8 (backgrounds limpios)
- **Negro Profundo:** #1A1A1A (textos principales)
- **Gris Neutro:** #8B8B8B (textos secundarios, divisores)

### Tone of Voice
- Avant-garde, experimental, juguetón pero técnico
- Accesible sin perder sofisticación
- Innovador, empoderador
- Evita jerga innecesaria

### Tipografía
- **Display (H1):** Poppins Bold - 36-48px
- **Headings (H2/H3):** Poppins Semi-Bold - 24-32px
- **Body:** Inter Regular - 14-16px
- **Código:** JetBrains Mono - 12-14px

---

## 📊 ESTRUCTURA DEL SITIO

### Páginas Principales

#### 1. HOME / LANDING
**Objetivo:** Convertir visitante → Click a secciones principales

**Contenido:**
- Header: Logo + Nav (Teclados | Raspi | Blog | Contacto | Idioma)
- Hero: Tagline + 3 CTAs principales (Explorar Teclados | Descubre Raspi | Lee Blog)
- 3 Cards de Destacados (1 por sección)
- Mini About: Párrafo + botón "Conóceme más"
- Footer: Links + Redes + Email + Copyright

#### 2. TECLADOS MECÁNICOS
**Objetivo:** Showcase teclados split + mostrar proceso de armado

**Sub-páginas:**
- **/teclados** - Catálogo principal con filtros
  - Filtros: Tipo | Precio (rango) | Stock (disponible/coming soon) | Material
  - Grid de 5-10 productos
  - Cada card: Imagen + nombre + precio + status + "Ver detalles"

- **/teclados/[producto-slug]** - Ficha de producto individual
  - Galería de imágenes (3-5 fotos)
  - Especificaciones técnicas (tabla)
  - Precio + Status (En Stock / Coming Soon)
  - Botones: "Contactar para comprar" (WhatsApp) | "Enviar consulta" (formulario)
  - Para Coming Soon: "Notificarme cuando llegue" (guarda email)

- **/teclados/build-guides** - Guías de armado
  - Grid de 3-5 guías con tarjetas
  - Cada guía: Imagen + nombre + tiempo estimado + descripción
  - Dentro de guía: Pasos con imágenes + videos embebidos + FAQs

#### 3. RASPI (Raspberry Pi)
**Objetivo:** Mostrar kits + Tutoriales de setup

**Sub-páginas:**
- **/raspi** - Catálogo
  - Similar a Teclados (filtros + grid)
  - 2-3 productos iniciales

- **/raspi/[producto-slug]** - Ficha de producto
  - Mismo layout que Teclados
  - Specs técnicas de hardware

- **/raspi/tutorials** - Guías de setup
  - "Cómo instalar Raspbian"
  - "Primeros pasos"
  - "GPIO y proyectos"

#### 4. BLOG
**Objetivo:** SEO + Content marketing (5-10 posts iniciales)

**Sub-páginas:**
- **/blog** - Landing del blog
  - Grid de posts (últimos primero)
  - Búsqueda + Filtro por categoría
  - Sidebar: Posts recientes

- **/blog/[slug]** - Post individual
  - Header: Imagen + título + meta (autor, fecha, tiempo lectura)
  - Tabla de contenidos clickeable
  - Contenido: Prosa + imágenes + código con syntax highlighting
  - Footer: Comparte + Posts relacionados

- **/blog/categoria/[nombre]** - Filtro por categoría
  - Categorías: Teclados | Raspi | Tech | Gaming

#### 5. PÁGINAS GLOBALES

- **/about** - Sobre Robert
  - Foto + Historia personal + Misión + Valores
  - CTA: "Conectemos en WhatsApp"

- **/contact** - Formulario de contacto
  - Lado izquierdo: Formulario (Nombre, Email, Asunto, Mensaje)
  - Lado derecho: WhatsApp link + Email + Redes

- **/terms** - Términos y condiciones
  - Básico para MVP (mejorar después)

- **/privacy** - Política de privacidad
  - Básico para MVP

- **/404** - Página de error
  - Mensaje amigable + 3 links de navegación

### Componentes Globales (En TODAS las páginas)

- **Header:** Logo + Nav + Idioma toggle (ES/EN)
- **Footer:** Links + Redes + Email + Copyright
- **Responsive:** Desktop (1200px+) | Tablet (768-1199px) | Mobile (<768px)

---

## 🛒 SISTEMA DE PAGOS - ARQUITECTURA MODULAR

### Principios de Diseño

✅ **Patrón Strategy:** Cada gateway es intercambiable
✅ **Patrón Factory:** Crea instancia correcta sin duplicar código
✅ **Escalable:** Agregar Stripe/PayPal = crear 1 archivo
✅ **Testeable:** Mockear interfaces es trivial
✅ **Mantenible:** Cambios en un gateway no rompen otros

### Estructura de Carpetas

```
src/payments/
├── interfaces/
│   └── PaymentGateway.ts          // Interface (contrato)
├── strategies/
│   ├── MercadoPagoGateway.ts      // Implementación MP (MVP)
│   ├── StripeGateway.ts           // Implementación Stripe (futura)
│   └── PayPalGateway.ts           // Implementación PayPal (futura)
├── factory/
│   └── PaymentGatewayFactory.ts   // Factory pattern
├── types/
│   └── payment.types.ts           // Tipos compartidos
└── webhooks/
    ├── mercadopago-webhook.ts     // Handler MP
    ├── stripe-webhook.ts          // Handler Stripe
    └── webhook-dispatcher.ts      // Dispatcher central

src/api/
├── payment.ts                     // POST /api/payment (crear sesión)
└── webhooks/
    ├── mercadopago.ts             // POST /api/webhooks/mercadopago
    └── stripe.ts                  // POST /api/webhooks/stripe
```

### Métodos Soportados

**MVP (Implementado):**
- Mercado Pago (Métodos locales: Yape, Plin, transferencia bancaria)

**Fase 2 (Próximamente):**
- Stripe (Para internacionalización)
- PayPal (Alternativa global)

### Flujo de Pago

1. **Usuario hace click "Comprar"** → Abre modal/pagina de checkout
2. **Frontend envía:** POST /api/payment { productId, quantity, method, email }
3. **Backend (Factory):** Crea instancia del gateway correcto (ej: MercadoPagoGateway)
4. **Gateway:** Crea sesión de pago → Retorna URL de checkout
5. **Frontend:** Redirige a gateway (Mercado Pago checkout)
6. **Usuario paga** en gateway
7. **Gateway envía webhook** → POST /api/webhooks/mercadopago
8. **Backend (Dispatcher):** Procesa webhook → Actualiza orden en BD
9. **Sistema emite eventos:** paymentCompleted → Envía email, notificaciones, etc

### Métodos por Gateway (Interfaz Común)

Cada gateway implementa:
- `createCheckoutSession()` - Crea sesión y retorna URL
- `handleWebhook()` - Procesa confirmación de pago
- `validateTransaction()` - Valida transacción contra gateway
- `refund()` - Procesa reembolso
- `isConfigured()` - Verifica que tenga credenciales

---

## 📱 CONTENIDO INICIAL (Para Lanzamiento)

### Productos
- **Teclados Mecánicos:** 5-10 productos
  - 3-5 disponibles en stock (con fotos reales)
  - 2-3 coming soon (pre-orden, con renders)
- **Raspi:** 2-3 productos
  - 1-2 en stock
  - 1 coming soon
- **Microcontroladores:** 0 inicialmente (agregar en Fase 2)

### Blog
- **5-10 posts iniciales**
  - 50% Tutoriales (setup, armado, primeros pasos)
  - 50% Artículos de interés (reseñas, noticias, opiniones)

### Otros Contenidos
- About: 2-3 párrafos sobre Robert + foto (opcional)
- Terms: Básico, genérico
- Privacy: Básico, genérico
- Imágenes/Assets: Logo + hero image + iconografía

---

## 🏗️ STACK TÉCNICO

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript
- **Styling:** Tailwind CSS
- **Estado:** React hooks (useState, useContext) + opcional Zustand
- **Componentes:** Radix UI o Headless UI (para accesibilidad)
- **Imágenes:** Next.js Image optimization
- **Multiidioma:** next-intl o i18next

### Backend
- **Runtime:** Node.js (con Next.js API Routes)
- **Base de datos:** MongoDB (Mongoose ODM) o PostgreSQL
- **Autenticación:** JWT (simple) o NextAuth
- **Email:** Brevo o SendGrid (para notificaciones)
- **Analytics:** Google Analytics 4
- **Webhooks:** Stripe/MP webhooks nativos

### Infraestructura
- **Hosting:** Vercel (Next.js) o similar
- **Base de datos:** MongoDB Atlas (gratuito tier) o PostgreSQL en Railway
- **Dominio:** Namecheap o GoDaddy
- **CDN:** Cloudflare (gratuito)
- **SSL:** Automático con Vercel

### Integraciones
- Mercado Pago API
- Google Analytics
- Brevo (email)
- Stripe (Fase 2)

---

## 📅 TIMELINE DE DESARROLLO

### FASE 1: SETUP INICIAL (1 semana)

**Semana 1 - Infraestructura**
- [ ] Crear repo en GitHub
- [ ] Setup Next.js + TypeScript + Tailwind
- [ ] Configurar linting (ESLint) + formatting (Prettier)
- [ ] Setup MongoDB / PostgreSQL
- [ ] Crear estructura base de carpetas
- [ ] Setup variables de entorno
- [ ] Deploy inicial en Vercel (esqueleto)
- [ ] Configurar dominio

**Entregables:**
- Repo con estructura base
- Sitio deployado (sin contenido)
- CI/CD configurado

---

### FASE 2: CORE PAGES (2 semanas)

**Semana 2 - Estructura Base**
- [ ] Home/Landing (hero + CTAs)
- [ ] Header/Footer/Nav
- [ ] Layouts base (secciones)
- [ ] Sistema de rutas ES/EN
- [ ] Componentes reutilizables (Card, Button, etc)

**Semana 3 - Páginas Globales**
- [ ] About page
- [ ] Contact page (formulario + WhatsApp)
- [ ] Terms / Privacy
- [ ] 404 page
- [ ] Google Analytics integrado

**Entregables:**
- Home funcional
- Navegación completa (ES/EN)
- Páginas legales
- Sistema de contacto básico

---

### FASE 3: TECLADOS SECTION (1.5 semanas)

**Semana 4 - Catálogo**
- [ ] Página /teclados (catálogo principal)
- [ ] Sistema de filtros (tipo, precio, stock, material)
- [ ] Grid de productos
- [ ] Búsqueda básica

**Semana 4 (continuación) - Fichas**
- [ ] Página de producto individual
- [ ] Galería de imágenes
- [ ] Especificaciones técnicas (tabla)
- [ ] CTAs: "Contactar" + "Enviar consulta"
- [ ] Status badges (en stock / coming soon)
- [ ] "Notificarme" para coming soon

**Entregables:**
- Catálogo de teclados funcional
- 5-10 productos cargados en BD
- Fichas de producto con detalles

---

### FASE 4: RASPI SECTION (1 semana)

**Semana 5 - Raspi**
- [ ] Página /raspi (catálogo)
- [ ] Fichas de producto (similar a teclados)
- [ ] Página /raspi/tutorials
- [ ] 3-5 guías/tutoriales básicos
- [ ] 2-3 productos cargados

**Entregables:**
- Sección Raspi completa
- Tutoriales disponibles

---

### FASE 5: BLOG SECTION (1.5 semanas)

**Semana 5 (continuación) - Blog**
- [ ] Página /blog (landing)
- [ ] Fichas de post individual
- [ ] Sistema de categorías
- [ ] Búsqueda de posts
- [ ] Sidebar (posts recientes)
- [ ] Syntax highlighting para código

**Semana 6 - Contenido**
- [ ] 5-10 posts iniciales redactados/editados
- [ ] Imágenes para posts
- [ ] SEO básico (meta tags dinámicos)
- [ ] Sitemap

**Entregables:**
- Blog funcional con contenido
- Posts publicados
- Categorización completa

---

### FASE 6: BUILD GUIDES (1 semana)

**Semana 6 (continuación) - Guías**
- [ ] Página /teclados/build-guides
- [ ] Sistema de guías de armado
- [ ] 3-5 guías con pasos + imágenes
- [ ] Videos embebidos (opcional)
- [ ] FAQs en guías

**Entregables:**
- Build guides completos
- Contenido educativo disponible

---

### FASE 7: SISTEMA DE PAGOS (2 semanas)

**Semana 7 - Arquitectura Modular**
- [ ] Diseñar interfaces/contratos (PaymentGateway)
- [ ] Implementar PaymentGatewayFactory
- [ ] Implementar MercadoPagoGateway (completo)
- [ ] Preparar estructura para Stripe/PayPal
- [ ] Crear tipos compartidos

**Semana 8 - Integración**
- [ ] API endpoint POST /api/payment
- [ ] Webhook handler /api/webhooks/mercadopago
- [ ] Webhook dispatcher (maneja todos los gateways)
- [ ] Actualizar modelo Order en BD
- [ ] Testing de flujo completo (sandbox MP)
- [ ] Error handling + retry logic

**Entregables:**
- Sistema de pagos completo con Mercado Pago
- Arquitectura modular lista para escalar
- Webhooks funcionales

---

### FASE 8: ADMIN DASHBOARD (1 semana)

**Semana 8 (continuación) - Admin**
- [ ] Login/Autenticación simple
- [ ] Dashboard principal (stats básicas)
- [ ] CRUD de productos (crear, editar, borrar)
- [ ] Gestión de stock
- [ ] Status de producto (activo/inactivo/coming soon)
- [ ] Listado de órdenes (básico)

**Entregables:**
- Admin dashboard funcional
- Gestión de inventario

---

### FASE 9: PULIDO + TESTING (1 semana)

**Semana 9 - QA + Optimización**
- [ ] Testing en todos los navegadores (mobile, tablet, desktop)
- [ ] Optimización de imágenes
- [ ] Performance audit (Lighthouse)
- [ ] Testing de flujos de pago
- [ ] Testing en dispositivos reales
- [ ] SEO audit
- [ ] Accesibilidad (WCAG 2.1 AA)
- [ ] Bug fixes
- [ ] Documentación de código

**Entregables:**
- Sitio optimizado
- Sin bugs críticos
- Performance > 90 Lighthouse

---

### FASE 10: LANZAMIENTO (Último día)

**Semana 10 - Go Live**
- [ ] Último QA
- [ ] Configurar análytics
- [ ] Prueba de pagos en producción
- [ ] Monitoreo activo
- [ ] Soporte inicial para usuarios
- [ ] Anuncio en redes sociales

**Entregables:**
- MVP en producción
- Soporte activo

---

## 📊 CHECKLIST MVP

### FUNCIONALIDADES CRÍTICAS (Sin esto NO lanzas)
- [ ] Home + 3 secciones funcionales (Teclados | Raspi | Blog)
- [ ] Catálogo de productos con filtros
- [ ] Fichas de producto con detalles
- [ ] Sistema de pagos (Mercado Pago)
- [ ] Contacto directo (WhatsApp + Formulario)
- [ ] Responsividad completa
- [ ] Multiidioma (ES/EN)
- [ ] Google Analytics
- [ ] SSL/HTTPS

### NICE-TO-HAVE (Agregar después)
- [ ] Stripe / PayPal
- [ ] Carrito persistente
- [ ] Wishlist
- [ ] Reviews/Ratings
- [ ] Comunidad (Discord)
- [ ] Recomendaciones IA
- [ ] Admin dashboard avanzado
- [ ] Newsletter automático
- [ ] Sistema de puntos/rewards

---

## 🎯 MÉTRICAS DE ÉXITO (MVP)

### Técnicas
- Lighthouse score > 90
- Mobile responsive: 100%
- Zero critical bugs
- Pagos: 100% de transacciones completadas
- Uptime: > 99%

### de Negocio
- Visitantes únicos: 500+ mes 1
- Tasa de conversión contacto: > 10%
- Tiempo en sitio: > 2 min promedio
- Bounce rate: < 50%
- Time to checkout: < 2 min

---

## 🔄 FLUJOS DE USUARIO CLAVE

### Flujo 1: Exploración y Contacto (Producto en Stock)
1. Usuario → Home
2. Click "Explorar Teclados"
3. Ve catálogo con filtros
4. Selecciona teclado
5. Lee detalles en ficha
6. Click "Contactar para comprar"
7. Se abre WhatsApp prefilled
8. Negocia vía WhatsApp (fuera del sitio)

### Flujo 2: Notificación Coming Soon
1. Usuario ve producto "Coming Soon"
2. Click "Notificarme cuando llegue"
3. Ingresa email
4. Se guarda en BD
5. Cuando disponible → Email de notificación

### Flujo 3: Búsqueda de Información
1. Usuario → Home
2. Click "Lee Nuestro Blog"
3. Ve últimos posts
4. Busca por palabra clave O filtra por categoría
5. Lee post completo
6. Navega a posts relacionados

### Flujo 4: Compra (con Mercado Pago)
1. Usuario selecciona producto
2. Click "Comprar"
3. Abre modal de checkout
4. Selecciona "Mercado Pago"
5. Ingresa email/datos
6. Se redirige a MP
7. Paga en MP
8. Webhook confirma → BD se actualiza
9. Email de confirmación

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Atrasos en desarrollo | Media | Alto | Sprint structure + daily standups |
| Problemas con MP API | Baja | Alto | Testing en sandbox + documentación |
| Performance issues | Media | Medio | Lighthouse audits + optimization |
| Bug crítico en pago | Baja | Alto | Testing exhaustivo + staging env |
| Falta de contenido | Media | Medio | Plan de redacción semana 1 |
| Requerimientos cambian | Alta | Medio | Documentar cambios + versioning |

---

## 📱 PRUEBAS REQUERIDAS (MVP)

### Funcionalidad
- [ ] Navegación (es/en)
- [ ] Filtros de productos
- [ ] Búsqueda en blog
- [ ] Flujo de pagos completo
- [ ] Webhook de MP
- [ ] Formulario de contacto

### Cross-browser
- [ ] Chrome (últimas 2 versiones)
- [ ] Firefox (últimas 2 versiones)
- [ ] Safari (últimas 2 versiones)
- [ ] Edge (últimas 2 versiones)

### Dispositivos
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad 768x1024)
- [ ] Mobile (iPhone 375x667, Android 360x640)

### Performance
- [ ] Lighthouse > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

---

## 📚 DOCUMENTACIÓN A CREAR

### Para Desarrollador
- [ ] README.md (setup + deploy)
- [ ] ARCHITECTURE.md (estructura proyecto)
- [ ] PAYMENTS.md (guía de sistema de pagos)
- [ ] DEPLOYMENT.md (instrucciones deploy)
- [ ] ENV_VARS.md (variables de entorno)
- [ ] API.md (endpoints principales)

### Para Admin
- [ ] USER_GUIDE.md (cómo usar admin dashboard)
- [ ] MANAGING_PRODUCTS.md (agregar/editar productos)
- [ ] MANAGING_ORDERS.md (ver órdenes)
- [ ] TROUBLESHOOTING.md (problemas comunes)

### Para Usuario
- [ ] FAQ.md (preguntas frecuentes)
- [ ] SHIPPING.md (costos y tiempos de envío)
- [ ] RETURNS.md (política de devoluciones)

---

## 🎁 BENEFICIOS DE ESTA ARQUITECTURA

### Para Trebor Labs
✅ Lanzamiento rápido (MVP 8 semanas)
✅ Escalable (agregar Stripe = 1 archivo)
✅ Mantenible (cada sección es independiente)
✅ Flexible (pivotear fácilmente)

### Para el Proyecto
✅ Sin código duplicado
✅ Cambios sin romper nada
✅ Testing simple
✅ Onboarding fácil para nuevos devs

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

1. **Aprobación del plan** ← Estamos aquí
2. **Crear repo + setup inicial** (1-2 días)
3. **Inicio Fase 1** (setup infraestructura)
4. **Primera revisión** (end of Semana 1)

---

## 📝 NOTAS FINALES

- Este plan es **flexible** pero debemos ser disciplinados
- **Daily standups recomendados** (15 min)
- **Code reviews** en cada PR
- **Testing durante desarrollo**, no al final
- **Documentar decisiones** en GitHub discussions

**¡Listo para construir Trebor Labs! 💜⌨️**
