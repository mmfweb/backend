# Portfolio API (backend)

API Express para el portfolio de **Mariana Marin**: proyectos desde GitHub, trayectoria y formulario de contacto por correo.

## Stack

- Node.js 20+, Express, TypeScript
- Despliegue recomendado: **Render** (`render.yaml` incluido)
- Alternativas: Fly.io, Koyeb, VPS con Node
- Frontend: **Vercel** — repo [mmfweb/front](https://github.com/mmfweb/front)

## Desarrollo local

```bash
npm install
cp .env.example .env
```

En `.env` para desarrollo:

- No uses `NODE_ENV=production`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `GITHUB_TOKEN`, `SMTP_*`, `CONTACT_TO` según `.env.example`

```bash
npm run dev
```

- API: http://localhost:3000  
- Health: http://localhost:3000/api/health  

Arranca el frontend por separado (`npm run dev` en su carpeta, puerto 5173).

## Producción (Render) — recomendado

| Paso | Acción |
|------|--------|
| 1 | [render.com](https://render.com) → cuenta gratis → **New +** → **Web Service** |
| 2 | Conectar GitHub → repo **mmfweb/backend** |
| 3 | Runtime: **Node** · Branch: `main` |
| 4 | Build: `npm install && npm run build` · Start: `npm start` |
| 5 | Health check path: `/api/health` |
| 6 | Variables de entorno (tabla abajo) |
| 7 | **Settings → Custom Domains** → `api.marianamarinflor.com` |
| 8 | En Porkbun: CNAME `api` → el host que indique Render |

O importar blueprint: **New +** → **Blueprint** → repo `mmfweb/backend` (usa `render.yaml`).

Render inyecta `PORT` automáticamente. El plan free puede “dormir” el servicio tras inactividad (arranque ~30 s).

### Variables obligatorias en Render

| Variable | Ejemplo (`marianamarinflor.com`) |
|----------|----------------------------------|
| `NODE_ENV` | `production` |
| `FRONTEND_ORIGIN` | `https://www.marianamarinflor.com,https://marianamarinflor.com` |
| `GITHUB_TOKEN` | Token personal GitHub |
| `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` | Gmail + contraseña de aplicación |

Recomendadas:

| Variable | Valor |
|----------|--------|
| `CONTACT_PERSIST_MESSAGES` | `false` |
| `ADMIN_REFRESH_SECRET` | (opcional, para `?refresh=1`) |

### Dominio en Porkbun

| Tipo | Host | Valor |
|------|------|--------|
| CNAME | `api` | `portfolio-api-xxxx.onrender.com` (el que te dé Render) |

Prueba: `https://api.marianamarinflor.com/api/health`

En **Vercel** (frontend): `VITE_API_URL=https://api.marianamarinflor.com`

## Otras plataformas (sin Railway)

| Plataforma | Notas |
|------------|--------|
| **Fly.io** | `fly launch` + `fly deploy`, buen uptime |
| **Koyeb** | Similar a Render, GitHub + Node |
| **VPS** (Hetzner, etc.) | `npm run build && npm start` detrás de nginx |

No uses Vercel para este backend: es Express persistente, no serverless.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | API con recarga |
| `npm run build` | Compila `dist/server.cjs` |
| `npm start` | Producción |
| `npm run lint` | TypeScript |
| `npm run test:email` | Prueba SMTP (Ethereal) |

## Endpoints

| Método | Ruta |
|--------|------|
| GET | `/api/health` |
| GET | `/api/config` |
| GET | `/api/projects` |
| GET | `/api/trajectory` |
| POST | `/api/messages` |

## Seguridad

Ver [SECURITY.md](./SECURITY.md).

## Archivos que no van a Git

- `.env`
- `db_store.json`
- `github_projects_cache.json`
- `node_modules/`, `dist/`
