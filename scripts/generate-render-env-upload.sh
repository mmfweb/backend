#!/usr/bin/env bash
# Genera render.env.upload desde .env (para Render → Environment → Add from .env)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="render.env.upload"

if [[ ! -f .env ]]; then
  echo "❌ No existe backend/.env"
  exit 1
fi

{
  echo "NODE_ENV=production"
  echo "FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com,https://frontend-five-topaz-53.vercel.app"
  echo "CONTACT_PERSIST_MESSAGES=false"
  grep -v '^#' .env | grep -v '^$' | grep -v '^RAILWAY_' | grep -v '^RENDER_'
} > "$OUT"

echo "✓ Creado $OUT ($(wc -l < "$OUT" | tr -d ' ') líneas)"
echo "  Render → New → Blueprint → mmfweb/backend"
echo "  Luego: Environment → Add from .env → pega el contenido de $OUT"
echo "  Save, rebuild, and deploy"
