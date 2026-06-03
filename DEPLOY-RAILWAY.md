# Deploy en Railway — marianamarinflor.com

## Lo que necesitas pasar (solo en Railway / variables, no en el chat)

Crea un token en https://railway.com/account/tokens y úsalo en local:

```bash
export RAILWAY_TOKEN="tu_token"
```

O conéctalo en el dashboard: **New Project** → **Deploy from GitHub** → `mmfweb/backend`.

### Variables en Railway (Settings → Variables)

```
NODE_ENV=production
FRONTEND_ORIGIN=https://www.marianamarinflor.com,https://marianamarinflor.com
GITHUB_USERNAME=marianamarinflor622
GITHUB_TOKEN=(token GitHub)
CONTACT_TO=infomarianamarin@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=infomarianamarin@gmail.com
SMTP_PASS=(contraseña aplicación Gmail)
CONTACT_PERSIST_MESSAGES=false
```

### Dominio

Networking → Custom Domain → `api.marianamarinflor.com`  
Porkbun: CNAME `api` → host `*.up.railway.app`

### Vercel (front)

`VITE_API_URL=https://api.marianamarinflor.com`
