# ─── Trebor Labs — Railway Deployment Guide ───────────────────────────────────
# Este archivo describe cómo desplegar el monorepo en Railway.
#
# ARQUITECTURA DE SERVICIOS:
# ┌─────────────────────────────────────────────────────────────┐
# │  Railway Project: Trebor Labs                                │
# │                                                              │
# │  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
# │  │  PostgreSQL   │  │  Backend (API)   │  │  Frontend    │  │
# │  │  (Railway DB) │──│  Fastify + Prisma│  │  Vite (CDN)  │  │
# │  └──────────────┘  └──────────────────┘  └──────────────┘  │
# └─────────────────────────────────────────────────────────────┘
#
# ─── PASOS DE DESPLIEGUE ───────────────────────────────────────
#
# 1. CREAR PROYECTO EN RAILWAY
#    - Ve a https://railway.app/new
#    - Conecta tu repositorio de GitHub
#
# 2. AGREGAR BASE DE DATOS
#    - Click en "+ New" → "Database" → "PostgreSQL"
#    - Railway proveerá automáticamente la variable DATABASE_URL
#
# 3. CONFIGURAR VARIABLES DE ENTORNO (Service Settings → Variables)
#
#    Requeridas:
#    ├── DATABASE_URL          → (auto-provista por Railway PostgreSQL)
#    ├── JWT_SECRET            → (string seguro de 64+ caracteres)
#    ├── BACKEND_URL           → https://tu-servicio.railway.app
#    ├── FRONTEND_URL          → https://treborlabs.com (o tu dominio)
#    ├── PORT                  → (auto-provisto por Railway, típicamente 3001)
#    ├── NODE_ENV              → production
#    ├── ADMIN_EMAIL           → admin@treborlabs.com
#    └── ADMIN_PASSWORD        → (contraseña segura para el admin seed)
#
#    Opcionales (habilitar según funcionalidad):
#    ├── GOOGLE_CLIENT_ID      → OAuth Google
#    ├── GOOGLE_CLIENT_SECRET  → OAuth Google
#    ├── GITHUB_CLIENT_ID      → OAuth GitHub
#    ├── GITHUB_CLIENT_SECRET  → OAuth GitHub
#    ├── GMAIL_USER            → Email transaccional
#    ├── GMAIL_APP_PASSWORD    → App password de Gmail
#    └── MP_ACCESS_TOKEN       → MercadoPago
#
# 4. FRONTEND (Opción A: Vercel / Netlify — RECOMENDADO)
#    - El frontend se puede desplegar en Vercel/Netlify para mejor CDN
#    - Configurar VITE_API_URL apuntando al backend de Railway
#    - Build command: cd apps/frontend && npm run build
#    - Output directory: apps/frontend/dist
#
# 4. FRONTEND (Opción B: Servido desde Backend)
#    - Si el backend sirve el frontend estático, agregar un build step
#    - El backend ya tiene @fastify/static configurado
#
# 5. DOMINIO PERSONALIZADO
#    - Settings → Domains → Custom Domain
#    - Agregar CNAME record en tu DNS provider
#
# ─── CHECKLIST PRE-DEPLOY ──────────────────────────────────────
#
# [ ] DATABASE_URL configurada
# [ ] JWT_SECRET generado (openssl rand -base64 64)
# [ ] BACKEND_URL y FRONTEND_URL correctos
# [ ] ADMIN_EMAIL y ADMIN_PASSWORD seguros
# [ ] NODE_ENV=production
# [ ] Migraciones de Prisma probadas localmente
# [ ] /api/health responde 200
# [ ] CORS configurado con FRONTEND_URL correcto
# [ ] Archivos estáticos del frontend compilados
