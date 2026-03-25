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

# ── 2. Recreate containers ───────────────────────────────────────────────────
echo "▶  Starting containers..."
$COMPOSE up -d
echo ""

# ── 3. Wait for backend to be healthy ────────────────────────────────────────
echo "▶  Waiting for backend..."
for i in $(seq 1 20); do
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "   ✗  Backend no responde. Logs:"
  echo ""
  $COMPOSE logs --tail 30 backend
  exit 1
fi
echo "   ✓  Backend OK"
echo ""

# ── 4. Summary ───────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║  ✓  Deploy completado                    ║"
echo "║                                          ║"
echo "║  Frontend  →  http://localhost:5173      ║"
echo "║  Backend   →  http://localhost:3001      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
