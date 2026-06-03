# API en Render (15 min) — para que aparezcan los proyectos

El front en Vercel llama a `https://api.marianamarinflor.com`. Esa URL **aún no apunta a un servidor Node**.

## Pasos

1. https://dashboard.render.com → **New +** → **Blueprint**
2. Repo: **mmfweb/backend** (conecta GitHub si hace falta)
3. Rellena variables marcadas **sync: false** (desde tu `.env`):
   - `GITHUB_TOKEN`, `GITHUB_USERNAME`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`
4. Espera deploy **Live** → copia la URL `https://portfolio-api-xxxx.onrender.com`
5. Prueba: `https://portfolio-api-xxxx.onrender.com/api/health`

## Dominio api.marianamarinflor.com

1. Render → servicio → **Settings → Custom Domains** → `api.marianamarinflor.com`
2. Porkbun → DNS → **CNAME** `api` → host que indique Render (ej. `portfolio-api.onrender.com`)
3. Quita **URL Forwarding** en Porkbun si afecta subdominios

## CORS

`FRONTEND_ORIGIN` en Render debe incluir:

- `https://www.marianamarinflor.com`
- `https://marianamarinflor.com`
- `https://frontend-five-topaz-53.vercel.app` (URL Vercel actual)

Ya está en `render.yaml`.

## Si usas solo la URL de Render (sin custom domain aún)

En Vercel → **Environment Variables** → cambia temporalmente:

`VITE_API_URL` = `https://portfolio-api-xxxx.onrender.com`

→ **Redeploy** el front.
