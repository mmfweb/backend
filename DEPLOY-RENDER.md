# API en Render (gratis) + Vercel (front)

## 1. Crear el servicio (Blueprint)

1. https://dashboard.render.com → login con **GitHub**
2. **New +** → **Blueprint**
3. Conecta repo **mmfweb/backend** (rama `main`)
4. Render lee `render.yaml` y crea **portfolio-api** (plan **Free**, región **Frankfurt**)
5. Te pedirá rellenar variables **sync: false** — copia desde tu `backend/.env`:
   - `GITHUB_USERNAME`
   - `GITHUB_TOKEN`
   - `CONTACT_TO`
   - `SMTP_USER`
   - `SMTP_PASS`
6. **Apply** → espera estado **Live**

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
