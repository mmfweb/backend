# Portfolio API (backend)

API Express — repo [mmfweb/backend](https://github.com/mmfweb/backend).

## Despliegue recomendado

| Parte | Plataforma |
|-------|------------|
| **Web** | Vercel → [mmfweb/front](https://github.com/mmfweb/front) |
| **API** | **Render Free** → `api.marianamarinflor.com` |

Guía API: **[DEPLOY-RENDER.md](./DEPLOY-RENDER.md)** · Blueprint: `render.yaml`

Otras: [DEPLOY-KOYEB.md](./DEPLOY-KOYEB.md) · [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md)

## Desarrollo local

```bash
npm install && cp .env.example .env && npm run dev
```

http://localhost:3000/api/health

## Variables producción

`FRONTEND_ORIGIN`, `GITHUB_TOKEN`, `SMTP_*`, `CONTACT_TO`, `CONTACT_PERSIST_MESSAGES=false`

Ver `.env.example`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`

## Seguridad

[SECURITY.md](./SECURITY.md)
