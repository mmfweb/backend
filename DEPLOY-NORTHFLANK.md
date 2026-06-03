# API en Northflank (para Vercel front)

## Crear servicio (5 min)

1. https://app.northflank.com → **Create project**
2. **Add service** → **Combined** (build + run) o **Git**
3. Conecta **GitHub** → repo **mmfweb/backend** · rama `main`
4. **Build**
   - Build type: **Dockerfile** (usa el `Dockerfile` del repo)  
     *o* Buildpack Node: build `npm install && npm run build`, start `npm start`
5. **Port:** `3000` (Northflank suele inyectar `PORT`; el servidor ya lo lee)
6. **Variables** (desde tu `.env` local, no subir el archivo):

```
NODE_ENV=production
FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com
CONTACT_PERSIST_MESSAGES=false
GITHUB_USERNAME=...
GITHUB_TOKEN=...
GITHUB_REPO_LIMIT=12
GITHUB_PUBLIC_REPO_COUNT=32
GITHUB_REPO_EXCLUDE=vibe-tracking
CONTACT_TO=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

7. **Deploy** → espera **Running**
8. **Networking / Domains** → `api.marianamarinflor.com` → copia CNAME
9. **Porkbun:** CNAME `api` → valor de Northflank

Prueba: https://api.marianamarinflor.com/api/health

---

## Con Vercel

En Vercel (`mmfweb/front`): `VITE_API_URL=https://api.marianamarinflor.com`

`FRONTEND_ORIGIN` en Northflank debe incluir exactamente las URLs HTTPS del front en Vercel.
