#!/usr/bin/env bash
# Crea servicio nuevo en Render (si no existe) + env + deploy.
# Requiere: RENDER_API_KEY en .env. Opcional: RENDER_OWNER_ID (si no, lista owners).
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
  echo "   https://dashboard.render.com/u/settings#api-keys"
  echo ""
  echo "Sin API key: ejecuta  bash scripts/generate-render-env-upload.sh"
  echo "y usa Blueprint + Add from .env (ver DEPLOY-RENDER.md)"
  exit 1
fi

AUTH="Authorization: Bearer ${RENDER_API_KEY}"
API_BASE="https://api.render.com/v1"

export NODE_ENV="${NODE_ENV:-production}"
export FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-https://www.marianamarinflor.com,https://marianamarinflor.com,https://frontend-five-topaz-53.vercel.app}"
export CONTACT_PERSIST_MESSAGES="${CONTACT_PERSIST_MESSAGES:-false}"
export GITHUB_REPO_LIMIT="${GITHUB_REPO_LIMIT:-12}"
export GITHUB_PUBLIC_REPO_COUNT="${GITHUB_PUBLIC_REPO_COUNT:-32}"
export GITHUB_REPO_EXCLUDE="${GITHUB_REPO_EXCLUDE:-vibe-tracking}"
export SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
export SMTP_PORT="${SMTP_PORT:-587}"

build_env_json() {
  python3 <<'PY'
import json, os
keys = [
    "NODE_ENV", "FRONTEND_ORIGIN", "CONTACT_PERSIST_MESSAGES",
    "GITHUB_USERNAME", "GITHUB_TOKEN", "GITHUB_REPO_LIMIT",
    "GITHUB_PUBLIC_REPO_COUNT", "GITHUB_REPO_EXCLUDE",
    "LINKEDIN_PROFILE_URL", "CONTACT_TO", "SMTP_HOST", "SMTP_PORT",
    "SMTP_USER", "SMTP_PASS",
]
print(json.dumps([{"key": k, "value": os.environ[k]} for k in keys if os.environ.get(k, "").strip()]))
PY
}

SERVICE_ID="${RENDER_SERVICE_ID:-}"

if [[ -n "$SERVICE_ID" ]] && curl -sf -H "$AUTH" "$API_BASE/services/$SERVICE_ID" >/dev/null 2>&1; then
  echo "✓ Servicio existente: $SERVICE_ID"
else
  OWNER_ID="${RENDER_OWNER_ID:-}"
  if [[ -z "$OWNER_ID" ]]; then
    OWNER_ID="$(curl -sf -H "$AUTH" -H "Accept: application/json" "$API_BASE/owners?limit=20" | python3 -c "
import json,sys
data=json.load(sys.stdin)
for o in data:
  item=o.get('owner',o)
  print(item.get('id',''))
  break
")"
  fi
  if [[ -z "$OWNER_ID" ]]; then
    echo "❌ No se pudo obtener ownerId. Añade RENDER_OWNER_ID en .env (Workspace Settings en Render)"
    exit 1
  fi

  echo "→ Creando servicio portfolio-api en Render..."
  payload="$(python3 <<PY
import json
env = json.loads('''$(build_env_json)''')
print(json.dumps({
  "type": "web_service",
  "name": "portfolio-api",
  "ownerId": "$OWNER_ID",
  "repo": "https://github.com/mmfweb/backend",
  "branch": "main",
  "autoDeploy": "yes",
  "serviceDetails": {
    "runtime": "node",
    "plan": "free",
    "region": "frankfurt",
    "envSpecificDetails": {
      "buildCommand": "npm install --include=dev && npm run build",
      "startCommand": "npm start",
      "healthCheckPath": "/api/health"
    }
  },
  "envVars": env
}))
PY
)"

  resp="$(curl -sf -X POST -H "$AUTH" -H "Content-Type: application/json" -d "$payload" "$API_BASE/services")"
  SERVICE_ID="$(echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('service',d).get('id',''))")"
  if [[ -z "$SERVICE_ID" ]]; then
    echo "❌ Error creando servicio:"
    echo "$resp"
    exit 1
  fi
  echo "✓ Nuevo servicio: $SERVICE_ID"
  echo "  Añade a .env: RENDER_SERVICE_ID=$SERVICE_ID"
fi

echo "→ Actualizando variables..."
curl -sf -X PUT -H "$AUTH" -H "Content-Type: application/json" \
  -d "$(build_env_json)" \
  "$API_BASE/services/$SERVICE_ID/env-vars" >/dev/null

echo "→ Deploy..."
curl -sf -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}' \
  "$API_BASE/services/$SERVICE_ID/deploys" >/dev/null

echo ""
echo "✓ Listo. Service ID: $SERVICE_ID"
echo "  Dashboard → portfolio-api → Logs"
