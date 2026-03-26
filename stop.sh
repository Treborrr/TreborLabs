#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f docker/docker-compose.yml"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          TreborLabs — Stop               ║"
echo "╚══════════════════════════════════════════╝"
echo ""

$COMPOSE down

echo ""
echo "   ✓  Contenedores detenidos."
echo ""
