#!/usr/bin/env bash
# Deploy backend a Railway. Token en backend/.env → RAILWAY_TOKEN=...
set -euo pipefail
cd "$(dirname "$0")/.."

# Cargar .env (exporta RAILWAY_TOKEN y el resto)
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Cuenta (init, variables, whoami): https://railway.com/account/tokens → RAILWAY_API_TOKEN
# Proyecto (solo railway up en CI): Project → Settings → Tokens → RAILWAY_TOKEN
if [[ -z "${RAILWAY_API_TOKEN:-}" || "$RAILWAY_API_TOKEN" == *"PEGA_AQUI"* ]]; then
  if [[ -n "${RAILWAY_TOKEN:-}" && "$RAILWAY_TOKEN" != *"PEGA_AQUI"* ]]; then
    export RAILWAY_API_TOKEN="$RAILWAY_TOKEN"
    unset RAILWAY_TOKEN
    echo "ℹ️  Usando RAILWAY_TOKEN como token de cuenta. Mejor: RAILWAY_API_TOKEN en .env"
  fi
fi

if [[ -z "${RAILWAY_API_TOKEN:-}" ]]; then
  echo "❌ Falta token de cuenta en backend/.env:"
  echo "   RAILWAY_API_TOKEN=...  (https://railway.com/account/tokens)"
  echo "   o ejecuta: railway login"
  exit 1
fi

export RAILWAY_API_TOKEN
unset RAILWAY_TOKEN 2>/dev/null || true

if ! railway whoami &>/dev/null; then
  echo "❌ Railway no acepta el token."
  echo "   • Token de CUENTA: https://railway.com/account/tokens → RAILWAY_API_TOKEN en .env"
  echo "   • Un token de PROYECTO (Settings → Tokens) NO sirve para init/whoami; úsalo solo para CI."
  echo "   • Si ya lo usaste en el chat, revócalo y crea uno nuevo."
  echo "   • Alternativa: railway login  y vuelve a npm run deploy:railway"
  exit 1
fi

echo "✓ Railway: $(railway whoami)"

if [[ ! -f .railway/config.json ]] 2>/dev/null && [[ ! -f railway.toml ]]; then
  :
fi

if ! railway status &>/dev/null 2>&1; then
  echo "→ Creando proyecto Railway (portfolio-api)..."
  railway init -n "mariana-portfolio-api" 2>/dev/null || railway init
fi

echo "→ Variables de entorno..."
railway variables --set "NODE_ENV=production" --skip-deploys
railway variables --set "FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com" --skip-deploys
railway variables --set "CONTACT_PERSIST_MESSAGES=false" --skip-deploys

if [[ -f .env ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(echo "$line" | xargs)"
    [[ -z "$line" ]] && continue
    [[ "$line" == RAILWAY_* ]] && continue
    key="${line%%=*}"
    key="$(echo "$key" | tr -d '"' | xargs)"
    [[ "$key" == "NODE_ENV" || "$key" == "FRONTEND_ORIGIN" || "$key" == "CONTACT_PERSIST_MESSAGES" ]] && continue
    railway variables --set "$line" --skip-deploys 2>/dev/null || true
  done < .env
fi

echo "→ Deploy (railway up)..."
railway up --detach

echo "→ Dominio api.marianamarinflor.com (si falla, npm run setup:domain más tarde)..."
bash scripts/setup-domain.sh 2>/dev/null || true

echo ""
echo "✓ Deploy lanzado. Si el dominio no se configuró:"
echo "  npm run setup:domain"
echo "  Porkbun: CNAME api → CNAME de Railway"
echo "  Vercel: VITE_API_URL=https://api.marianamarinflor.com"
