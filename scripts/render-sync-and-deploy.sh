#!/usr/bin/env bash
# Sincroniza variables desde .env a Render y lanza deploy.
# Requiere en .env: RENDER_API_KEY, RENDER_SERVICE_ID (srv-...)
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${RENDER_API_KEY:-}" ]]; then
  echo "❌ Falta RENDER_API_KEY en backend/.env"
  echo "   1. https://dashboard.render.com/u/settings#api-keys → Create API Key"
  echo "   2. Pégala en .env: RENDER_API_KEY=rnd_..."
  exit 1
fi

if [[ -z "${RENDER_SERVICE_ID:-}" ]]; then
  echo "❌ Falta RENDER_SERVICE_ID en .env (ej. srv-d8g3bekp3tds73caovb0)"
  echo "   Render → portfolio-api → Settings → copia Service ID"
  exit 1
fi

API="https://api.render.com/v1/services/${RENDER_SERVICE_ID}"
AUTH="Authorization: Bearer ${RENDER_API_KEY}"

# Valores por defecto de producción
export NODE_ENV="${NODE_ENV:-production}"
export FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-https://www.marianamarinflor.com,https://marianamarinflor.com,https://frontend-five-topaz-53.vercel.app}"
export CONTACT_PERSIST_MESSAGES="${CONTACT_PERSIST_MESSAGES:-false}"
export GITHUB_REPO_LIMIT="${GITHUB_REPO_LIMIT:-12}"
export GITHUB_PUBLIC_REPO_COUNT="${GITHUB_PUBLIC_REPO_COUNT:-32}"
export GITHUB_REPO_EXCLUDE="${GITHUB_REPO_EXCLUDE:-vibe-tracking}"
export SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
export SMTP_PORT="${SMTP_PORT:-587}"

build_json_payload() {
  python3 <<'PY'
import json, os
keys = [
    "NODE_ENV", "FRONTEND_ORIGIN", "CONTACT_PERSIST_MESSAGES",
    "GITHUB_USERNAME", "GITHUB_TOKEN", "GITHUB_REPO_LIMIT",
    "GITHUB_PUBLIC_REPO_COUNT", "GITHUB_REPO_EXCLUDE",
    "LINKEDIN_PROFILE_URL", "CONTACT_TO", "SMTP_HOST", "SMTP_PORT",
    "SMTP_USER", "SMTP_PASS",
]
out = []
for k in keys:
    v = os.environ.get(k, "").strip()
    if v:
        out.append({"key": k, "value": v})
print(json.dumps(out))
PY
}

echo "→ Comprobando servicio Render..."
if ! curl -sf -H "$AUTH" -H "Accept: application/json" "$API" >/dev/null; then
  echo "❌ API key o Service ID incorrectos"
  exit 1
fi

echo "→ Subiendo variables de entorno..."
payload="$(build_json_payload)"
curl -sf -X PUT -H "$AUTH" -H "Content-Type: application/json" \
  -d "$payload" \
  "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars" >/dev/null

echo "→ Deploy..."
curl -sf -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}' \
  "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" >/dev/null

echo ""
echo "✓ Variables sincronizadas y deploy iniciado."
echo "  Render → portfolio-api → Logs / Events"
echo "  Health: tu URL onrender.com/api/health"
