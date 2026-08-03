# Webhook de leads (formulario)

El formulario de la landing envía **cada lead** vía **POST JSON** a un webhook.

## Configuración (Create React App)

El proyecto puede operar con **URL absoluta** (recomendado) o con **ORIGIN + ruta relativa**.

Importante: **no existe fallback** a `window.location.origin` (misma-origin), porque eso suele provocar el error:
`Cannot POST /webhook/...` (404 HTML en tu propio hosting de la landing).

## Variables de Entorno

En `.env`:

```bash
# Base URL del servidor API (para emails y webhooks)
REACT_APP_BASE_URL=https://vault-server-u5xa.onrender.com

# Webhook URL completa para leads
REACT_APP_LEAD_WEBHOOK_URL=https://vault-server-u5xa.onrender.com/webhook/workflows/YOUR_WORKFLOW_ID/Lead_Inbound_Webhook
```

## Opción recomendada: URL absoluta (cuando el webhook está en otro dominio)

En `.env`:

REACT_APP_BASE_URL=https://TU-DOMINIO
REACT_APP_LEAD_WEBHOOK_URL=https://TU-DOMINIO/webhook/...

## Opción alternativa: ORIGIN + PATH (cuando quieres mantener path relativo)

REACT_APP_BASE_URL=https://TU-DOMINIO
REACT_APP_LEAD_WEBHOOK_ORIGIN=https://TU-DOMINIO
REACT_APP_LEAD_WEBHOOK_URL=/webhook/...

1) Crea un archivo `.env` en la raíz del proyecto (mismo nivel que `package.json`).

2) Agrega la variable:

REACT_APP_LEAD_WEBHOOK_URL=PEGAR_AQUI_TU_URL

3) Reinicia el servidor de desarrollo (`npm start`) para que CRA lea el `.env`.

Tip: tienes un archivo `env.example` para copiar/pegar y luego renombrar a `.env` (no se versiona).

Ejemplo (tu caso):

REACT_APP_BASE_URL=https://vault-server-u5xa.onrender.com
REACT_APP_LEAD_WEBHOOK_URL=https://vault-server-u5xa.onrender.com/webhook/workflows/YOUR_WORKFLOW_ID/Lead_Inbound_Webhook

## Payload enviado (JSON)

Campos principales:
- `name` / `nombre`
- `phone` / `telefono`
- `message` / `mensaje`
- `source` / `fuente`

Campos extra (útiles para tu backend/webhook):
- `email`, `interest`

Metadata útil:
- `page_url`, `page_path`, `referrer`, `utm`, `user_agent`, `ts`

