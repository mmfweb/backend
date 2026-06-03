# Seguridad — API Portfolio

## Controles implementados

- CORS limitado a `FRONTEND_ORIGIN` (HTTPS en producción)
- Cabeceras: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Rate limit: contacto (5/15 min), refresh GitHub (3/15 min)
- Honeypot en formulario (`company`)
- Sin endpoint público de lectura de mensajes
- Errores genéricos al cliente en producción
- Saneamiento CRLF en campos de correo
- `GITHUB_TOKEN` obligatorio en producción
- JSON body limitado a 64 KB

## Variables sensibles

Nunca commitear `.env`. Rotar `GITHUB_TOKEN` y `SMTP_PASS` si se filtraron.

## Recomendaciones operativas

1. `CONTACT_PERSIST_MESSAGES=false` en Render (solo correo, sin PII en disco).
2. `ADMIN_REFRESH_SECRET` si usas sincronización forzada de GitHub.
3. Token GitHub: solo permiso público, sin scopes innecesarios.
4. Revisar dependencias: `npm audit` periódicamente.
