#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f docker/docker-compose.yml"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          TreborLabs — Deploy             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Rebuild images ────────────────────────────────────────────────────────
echo "▶  Rebuilding images..."
$COMPOSE build --quiet
echo "   Done."
echo ""

# ── 2. Recrear contenedores (force-recreate aplica schema nuevo) ─────────────
echo "▶  Starting containers (force-recreate)..."
$COMPOSE up -d --force-recreate
echo ""

# ── 3. Wait for DB to be healthy ─────────────────────────────────────────────
echo "▶  Waiting for database..."
for i in $(seq 1 30); do
  if $COMPOSE exec -T postgres pg_isready -U trebor -d treborlabs > /dev/null 2>&1; then
    echo "   ✓  Database OK"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "   ✗  Database no responde. Logs:"
    $COMPOSE logs --tail 20 postgres
    exit 1
  fi
  sleep 1
done
echo ""

# ── 4. Wait for backend to be healthy ────────────────────────────────────────
echo "▶  Waiting for backend (prisma db push + server start)..."
for i in $(seq 1 40); do
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✓  Backend OK"
    break
  fi
  if [ "$i" -eq 40 ]; then
    echo "   ✗  Backend no responde. Logs:"
    echo ""
    $COMPOSE logs --tail 40 backend
    exit 1
  fi
  sleep 2
done
echo ""

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║  ✓  Deploy completado                    ║"
echo "║                                          ║"
echo "║  Frontend  →  http://localhost:5173      ║"
echo "║  Backend   →  http://localhost:3001      ║"
echo "║  DB        →  localhost:5432             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 6. Mostrar estado de contenedores ────────────────────────────────────────
$COMPOSE ps
