# Portfolio API (backend)

API Express — repo [mmfweb/backend](https://github.com/mmfweb/backend).

## Despliegue recomendado

| Parte | Plataforma |
|-------|------------|
| **Web** | Vercel → [mmfweb/front](https://github.com/mmfweb/front) |
| **API** | **Northflank** → `api.marianamarinflor.com` |

Guía API: **[DEPLOY-NORTHFLANK.md](./DEPLOY-NORTHFLANK.md)** (incluye `Dockerfile`)

Alternativa: [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md) (horario punta en plan Free EU)

## Desarrollo local

```bash
npm install && cp .env.example .env && npm run dev
```

http://localhost:3000/api/health

## Variables producción

`FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com`  
`GITHUB_TOKEN`, `SMTP_*`, `CONTACT_TO`, `CONTACT_PERSIST_MESSAGES=false`

Ver `.env.example`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`

## Seguridad

[SECURITY.md](./SECURITY.md)
