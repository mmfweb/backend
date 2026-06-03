#!/usr/bin/env bash
# Tras railway login (o RAILWAY_API_TOKEN en .env): dominio api.marianamarinflor.com
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="api.marianamarinflor.com"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${RAILWAY_API_TOKEN:-}" && -n "${RAILWAY_TOKEN:-}" ]]; then
  export RAILWAY_API_TOKEN="$RAILWAY_TOKEN"
  unset RAILWAY_TOKEN
fi

if ! railway whoami &>/dev/null; then
  echo "❌ Ejecuta primero: railway login"
  echo "   o pon RAILWAY_API_TOKEN (cuenta) en backend/.env"
  exit 1
fi

if ! railway status &>/dev/null 2>&1; then
  echo "❌ Enlaza el proyecto: railway link"
  echo "   (elige el proyecto creado desde GitHub mmfweb/backend)"
  exit 1
fi

echo "→ Dominio personalizado: $DOMAIN"
echo ""
railway domain "$DOMAIN" || {
  echo ""
  echo "Si falla por peak hours, repite después de las 20:00 (hora España) o en el panel:"
  echo "  Service → Settings → Networking → Custom Domain → $DOMAIN"
  exit 1
}

echo ""
echo "✓ Añade en Porkbun (marianamarinflor.com → DNS):"
echo "  Tipo CNAME | Host: api | Valor: el CNAME que mostró Railway arriba"
echo ""
echo "Luego: https://$DOMAIN/api/health"
