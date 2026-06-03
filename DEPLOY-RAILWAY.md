# Deploy: Railway (API) + Vercel (web) — marianamarinflor.com

## Qué puedo hacer yo vs qué haces tú

| Acción | Quién |
|--------|--------|
| Código en GitHub | ✅ Hecho (`mmfweb/backend`, `mmfweb/front`) |
| Deploy Railway / Vercel | Tú en el panel **o** tú ejecutas `railway login` / `vercel login` en la terminal y yo lanzo comandos |
| DNS Porkbun | Tú (no tengo acceso a tu cuenta) |

**No pegues contraseñas en el chat.** Solo en Railway / Vercel / variables locales.

---

# 1. Railway (backend) — 15 min

## Opción A — GitHub + dominio (recomendada)

1. https://railway.com → Login con GitHub  
2. **New Project** → **Deploy from GitHub repo** → **mmfweb/backend**  
3. Railway detecta `railway.toml` (build + start + health).  
4. **Deploy** fuera de horario punta (plan Free, EU: antes de 08:00 o después de 20:00, hora España).  
5. Abre el servicio → **Variables** → pega desde tu `.env` local:

```
NODE_ENV=production
FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com
GITHUB_USERNAME=marianamarinflor622
GITHUB_TOKEN=...
GITHUB_REPO_LIMIT=12
GITHUB_PUBLIC_REPO_COUNT=32
GITHUB_REPO_EXCLUDE=vibe-tracking
CONTACT_TO=infomarianamarin@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=infomarianamarin@gmail.com
SMTP_PASS=...
CONTACT_PERSIST_MESSAGES=false
```

6. **Settings → Networking → Public Networking** → ON  
7. **Custom Domain** → `api.marianamarinflor.com` (o en terminal, tras `railway login`: `npm run setup:domain`)  
8. Copia el CNAME (ej. `xxxx.up.railway.app`) → Porkbun (paso 3)  
9. Prueba: https://api.marianamarinflor.com/api/health  

**Sí:** con deploy por GitHub puedes usar tu dominio; el código se actualiza con cada `git push` a `main`.

## Opción B — Terminal (para que el agente despliegue)

En la terminal de Cursor, en la carpeta del proyecto:

```bash
railway login
```

Luego dime **"ya estoy logueada en railway"** y puedo ejecutar el deploy desde aquí.

O con **token de cuenta** en `backend/.env` (no lo subas a Git):

```env
RAILWAY_API_TOKEN=tu_token_de_cuenta
```

Crear en https://railway.com/account/tokens (no confundir con el token del **proyecto**, que solo sirve para `railway up` en CI).

```bash
cd backend
npm run deploy:railway
```

---

# 2. Vercel (frontend) — 10 min

1. https://vercel.com → Login con GitHub  
2. **Add New Project** → **mmfweb/front**  
3. Framework: **Vite**  
4. **Environment Variables** (Production):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://api.marianamarinflor.com` |

5. **Deploy**  
6. **Settings → Domains**:
   - `www.marianamarinflor.com`
   - `marianamarinflor.com`  
7. Vercel muestra registros DNS → cópialos a Porkbun  

Para que el agente despliegue Vercel:

```bash
vercel login
cd frontend
VITE_API_URL=https://api.marianamarinflor.com vercel --prod
```

---

# 3. Porkbun (DNS)

En **marianamarinflor.com** → **DNS Records**:

| Tipo | Host | Valor |
|------|------|--------|
| CNAME | `api` | `xxxx.up.railway.app` (Railway) |
| CNAME | `www` | lo que indique Vercel |
| A/ALIAS | `@` | lo que indique Vercel (o redirect a www) |

**Importante:** desactiva o ajusta **URL Forwarding** si redirige todo el dominio y rompe `api` / `www`.

Espera 5–30 min de propagación.

---

# 4. Comprobar

- [ ] https://api.marianamarinflor.com/api/health → `{"ok":true,...}`  
- [ ] https://www.marianamarinflor.com → portfolio  
- [ ] Proyectos GitHub visibles  
- [ ] Formulario de contacto → correo en Gmail  

---

# Errores frecuentes

| Problema | Solución |
|----------|----------|
| **Peak hours** (`europe-west4-drams3a` … not available 8 AM – 8 PM Europe/Amsterdam) | Plan **Free**: en región **EU West** no se puede desplegar de **08:00 a 20:00** (hora de Ámsterdam/Madrid). Los cambios del panel (**Apply 3 changes** / Deploy) quedan guardados: vuelve a pulsar **Deploy** **después de las 20:00** o **antes de las 08:00**, o cambia región del servicio a **US West** / **US East** (Settings del servicio) y despliega en la franja no punta de esa zona. **Hobby** (~5 €/mes) quita el límite. |
| CORS | `FRONTEND_ORIGIN` = URLs exactas de Vercel (https, con/sin www) |
| 503 formulario | SMTP en Railway |
| Proyectos vacíos | `GITHUB_TOKEN` en Railway |
