# API en Render (gratis) + Vercel (front)

## 1. Crear el servicio (Blueprint)

1. https://dashboard.render.com → login con **GitHub**
2. **New +** → **Blueprint**
3. Conecta repo **mmfweb/backend** (rama `main`)
4. Render lee `render.yaml` y crea **portfolio-api** (plan **Free**, región **Frankfurt**)
5. En **Environment**, comprueba que existan **todas** estas (si falta alguna, el servicio no arranca):

| Variable | Valor |
|----------|--------|
| **FRONTEND_ORIGIN** | `https://www.marianamarinflor.com,https://marianamarinflor.com,https://frontend-five-topaz-53.vercel.app` |
| NODE_ENV | `production` |
| CONTACT_PERSIST_MESSAGES | `false` |
| GITHUB_REPO_LIMIT | `12` |
| GITHUB_PUBLIC_REPO_COUNT | `32` |
| GITHUB_REPO_EXCLUDE | `vibe-tracking` |
| SMTP_HOST | `smtp.gmail.com` |
| SMTP_PORT | `587` |

6. Te pedirá rellenar variables **sync: false** — copia desde tu `backend/.env`:
   - `GITHUB_USERNAME`
   - `GITHUB_TOKEN`
   - `CONTACT_TO`
   - `SMTP_USER`
   - `SMTP_PASS`
7. **Apply** → espera estado **Live**

**Deploy Failed:** abre **Logs** del deploy. Si dice `Faltan variables...`, en **Environment** añade todas las de `render.env.example` (valores secretos desde tu `.env`) → **Save** → **Manual Deploy**.

El aviso *"spin down with inactivity"* es normal en plan **Free** (no es el fallo).

Prueba la URL de Render: `https://portfolio-api-xxxx.onrender.com/api/health`

---

## 2. Dominio `api.marianamarinflor.com`

1. Render → servicio **portfolio-api** → **Settings** → **Custom Domains**
2. Añade `api.marianamarinflor.com`
3. **Porkbun** → quita **URL Forwarding** → CNAME:

| Tipo | Host | Valor |
|------|------|--------|
| CNAME | `api` | `portfolio-api-xxxx.onrender.com` (el que indique Render) |

4. Web (Vercel): A `www` y `@` → `76.76.21.21`

---

## 3. Vercel (frontend)

Variable en producción:

`VITE_API_URL=https://api.marianamarinflor.com`

Redeploy si cambias la URL.

---

## 4. Comprobar

- [ ] https://api.marianamarinflor.com/api/health → `{"ok":true,...}`
- [ ] https://api.marianamarinflor.com/api/projects → lista JSON
- [ ] https://www.marianamarinflor.com → proyectos visibles

---

## Notas plan Free

- El servicio **se duerme** tras ~15 min sin tráfico; la 1ª petición puede tardar **30–50 s**.
- Es normal en Render Free; no es un error de tu código.

---

## Enlace directo Blueprint

https://dashboard.render.com/select-repo?type=blueprint

(elige **mmfweb/backend**)
