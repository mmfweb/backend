# Portfolio API (backend)

API Express para el portfolio de **Mariana Marin**: proyectos desde GitHub, trayectoria y formulario de contacto por correo.

## Stack

- Node.js 20+, Express, TypeScript
- Despliegue recomendado: **Railway** (`railway.toml` incluido)
- Frontend asociado: **Vercel** (repo separado)

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

## Producción (Railway)

| Paso | Acción |
|------|--------|
| 1 | Repo GitHub solo con esta carpeta `backend/` |
| 2 | [Railway](https://railway.app) → New Project → Deploy from GitHub |
| 3 | Variables en **Variables** (ver tabla abajo) |
| 4 | Settings → Networking → **Generate domain** o dominio custom `api.tudominio.com` |
| 5 | Comprueba `https://tu-api.up.railway.app/api/health` |

Railway usa `railway.toml`: build `npm run build`, start `npm start`, health `/api/health`.

El puerto lo inyecta Railway en `PORT` (no hace falta fijarlo a mano).

### Variables obligatorias

| Variable | Ejemplo |
|----------|---------|
| `NODE_ENV` | `production` (o deja que `npm start` lo aplique) |
| `FRONTEND_ORIGIN` | `https://www.tudominio.com` |
| `GITHUB_TOKEN` | Token personal GitHub (sin scopes extra) |
| `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` | Gmail + contraseña de aplicación |

Opcionales recomendadas:

| Variable | Uso |
|----------|-----|
| `CONTACT_PERSIST_MESSAGES=false` | No guardar mensajes en `db_store.json` (solo email) |
| `ADMIN_REFRESH_SECRET` | Proteger `?refresh=1` en sincronización GitHub |
| `GITHUB_REPO_LIMIT`, `GITHUB_REPO_EXCLUDE`, etc. | Ver `.env.example` |

`FRONTEND_ORIGIN`: HTTPS, sin barra final. Varias URLs separadas por coma.

### Dominio custom en Railway

1. Settings → Networking → Custom Domain → `api.tudominio.com`  
2. En tu DNS: CNAME `api` → el host que indique Railway  
3. Espera SSL activo  
4. Usa esa URL en Vercel como `VITE_API_URL`

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
