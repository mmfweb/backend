# Portfolio API (backend)

API Express — repo [mmfweb/backend](https://github.com/mmfweb/backend).

## Despliegue: Railway + Vercel

Guía completa: [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md)

- **API:** Railway → `api.marianamarinflor.com`
- **Web:** Vercel → `www.marianamarinflor.com` → `VITE_API_URL=https://api.marianamarinflor.com`

Config: `railway.toml` (build, start, health `/api/health`).

## Desarrollo local

```bash
npm install && cp .env.example .env && npm run dev
```

http://localhost:3000/api/health

## Variables producción (Railway)

`FRONTEND_ORIGIN`, `GITHUB_TOKEN`, `SMTP_*`, `CONTACT_TO`, `CONTACT_PERSIST_MESSAGES=false`

Ver `.env.example`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`

## Seguridad

[SECURITY.md](./SECURITY.md)
