# API en Render (gratis) + Vercel (front)

## Si borraste el proyecto en Render

### Opción A — Rápida (recomendada, sin API key)

1. Genera el archivo de variables:
   ```bash
   cd backend
   npm run render:env-file
   ```
2. https://dashboard.render.com → **New +** → **Blueprint** → repo **mmfweb/backend**
3. Plan **Free** · región **Frankfurt**
4. Rellena las variables secretas que pida el Blueprint (desde tu `.env`)
5. **Environment** → **Add from .env** → abre `render.env.upload` y **pega todo**
6. **Save, rebuild, and deploy**

### Opción B — Todo desde terminal (con API key)

1. https://dashboard.render.com/u/settings#api-keys → **Create API Key**
2. En `backend/.env`: `RENDER_API_KEY=rnd_...`
3. ```bash
   cd backend
   npm run render:create
   ```
   Crea el servicio, sube variables y despliega.

---

## Variables obligatorias

Ver `render.env.example` o el archivo generado `render.env.upload`.

La más olvidada: **FRONTEND_ORIGIN** (sin ella el deploy falla con status 1).

---

## Dominio `api.marianamarinflor.com`

1. Render → **portfolio-api** → **Settings** → **Custom Domains**
2. Porkbun: quitar **URL Forwarding** · CNAME `api` → host de Render
3. Vercel: `VITE_API_URL=https://api.marianamarinflor.com`

---

## Plan Free

- Se duerme tras ~15 min sin tráfico (1ª petición lenta). Normal.
- No elijas **Starter ($7)**.
