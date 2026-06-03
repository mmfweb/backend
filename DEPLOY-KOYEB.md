# API gratis en Koyeb (recomendado si no quieres pagar)

## Por qué Koyeb (y no Northflank / Railway / Render)

| Plataforma | €/mes | Express sin cambiar | Dominio `api.*` | Problema |
|------------|-------|---------------------|-----------------|----------|
| **Koyeb Free** | **0** | Sí | Sí (hasta 5) | Tras 1 h sin tráfico se duerme; 1ª petición ~2–5 s |
| Northflank Sandbox | 0* | Sí | Sí | UI muestra planes de pago; a veces pide tarjeta |
| Railway Free | 0 | Sí | Sí | EU: no deploy 8:00–20:00 (hora España) |
| Render | 0 | Sí | Sí | No lo usamos (tu preferencia) |
| Oracle Always Free | 0 | Sí | Sí | VM manual; a menudo “out of capacity” |
| Cloud Run | 0† | Sí (Docker) | Sí | Suele pedir cuenta Google + tarjeta |

\* Solo si eliges instancia **Free**, no Eco de pago.  
† Cuota mensual generosa; configuración más técnica.

**Koyeb Free:** 1 servicio web, 512 MB RAM, región **Frankfurt** (bien para España), **sin tarjeta**, uso comercial permitido.

---

## Pasos (≈15 min)

### 1. Cuenta y servicio

1. https://www.koyeb.com → registro (GitHub)
2. **Create App** → **Web Service**
3. **GitHub** → repo **mmfweb/backend** · rama `main`
4. **Instance type:** **Free** (no Eco, no paid)
5. **Region:** **Frankfurt** (eu)
6. **Build:** Dockerfile del repo *o* build `npm install && npm run build`, run `npm start`
7. **Port:** `3000`

### 2. Variables de entorno

Desde tu `backend/.env` (no subas el archivo):

```
NODE_ENV=production
FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com,https://frontend-five-topaz-53.vercel.app
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

### 3. Dominio

1. Koyeb → app → **Domains** → `api.marianamarinflor.com`
2. Porkbun → **quitar URL Forwarding** → CNAME `api` → valor de Koyeb
3. Web (Vercel): A `www` y `@` → `76.76.21.21`

### 4. Comprobar

```bash
curl https://api.marianamarinflor.com/api/health
curl https://api.marianamarinflor.com/api/projects
```

En Vercel: `VITE_API_URL=https://api.marianamarinflor.com` (ya debería estar).

---

## Evitar “sueño” del plan Free (opcional)

Koyeb apaga el servicio tras **1 hora sin tráfico**. Para un portfolio suele bastar.

Si quieres despertarlo antes de una visita importante:

- https://cron-job.org (gratis) → cada **50 min** → `GET https://api.marianamarinflor.com/api/health`

---

## Si Koyeb no te deja crear Free

Plan B: **Railway** desplegar **después de las 20:00** o **antes de las 8:00** (hora España).  
Plan C: **Oracle Always Free** VM (si consigues instancia; guía aparte).
