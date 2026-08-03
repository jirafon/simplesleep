# Guía de Despliegue en Render

## Opción 1: Desplegar Backend + Frontend en un solo servicio (Recomendado)

Esta opción despliega todo en un solo servicio de Render. El backend sirve el frontend en producción.

### Pasos:

1. **Crear un nuevo Web Service en Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com/)
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub/GitLab

2. **Configuración del servicio:**

   **Name:** `siempresalud-server` (o el nombre que prefieras)

   **Root Directory:** (dejar vacío - Render detectará automáticamente)

   **Environment:** `Node`

   **Build Command:**
   ```bash
   cd server && npm install && cd ../client && npm install && npm run build
   ```

   **Start Command:**
   ```bash
   cd server && npm start
   ```

   **Plan:** Free o Paid (según necesites)

3. **Variables de Entorno en Render:**

   Ve a la sección "Environment" y agrega:

   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URL=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/test?retryWrites=true&w=majority
   JWT_SECRET=superdificildeobtener
   ```

   **Nota:** 
   - Render asigna un puerto automáticamente, pero puedes usar `PORT=10000` o dejar que Render lo maneje.
   - **IMPORTANTE: NO configures `REACT_APP_BASE_URL` en producción.** El frontend usa URLs relativas (`/api/...`) cuando está en producción y el backend sirve el frontend desde el mismo dominio. Esto evita errores de "Mixed Content" (HTTPS/HTTP).
   - Si tienes `REACT_APP_BASE_URL` configurada en Render, **elimínala** para que el código use URLs relativas automáticamente.

4. **Configuración adicional:**

   - **Auto-Deploy:** `Yes` (para que se despliegue automáticamente en cada push)
   - **Health Check Path:** `/health`

5. **Actualizar el código para producción:**

   El código ya está preparado para servir el frontend desde el backend en producción.

---

## Opción 2: Desplegar Backend y Frontend por separado

Si prefieres separar backend y frontend en servicios diferentes:

### Backend (Web Service):

1. **Crear Web Service para Backend:**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGO_URL=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/test?retryWrites=true&w=majority
     JWT_SECRET=superdificildeobtener
     ```

2. **Obtener la URL del backend:**
   - Render te dará una URL como: `https://doctor911-backend.onrender.com`
   - Guarda esta URL

### Frontend (Static Site):

1. **Crear Static Site para Frontend:**
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Variables de Entorno del Frontend:**
   ```
   REACT_APP_BASE_URL=https://doctor911-backend.onrender.com
   ```

3. **Actualizar setupProxy.js:**
   - En producción, el frontend no usará el proxy
   - Las llamadas a la API deben usar `REACT_APP_BASE_URL`

---

## Configuración Recomendada (Opción 1)

### Archivo `render.yaml` (opcional, para infraestructura como código):

Crea este archivo en la raíz del proyecto:

```yaml
services:
  - type: web
    name: doctor911
    env: node
    buildCommand: cd server && npm install && cd ../client && npm install && npm run build
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGO_URL
        sync: false  # Debes configurarlo manualmente en Render
      - key: JWT_SECRET
        sync: false  # Debes configurarlo manualmente en Render
    healthCheckPath: /health
```

### Variables de Entorno en Render Dashboard:

1. Ve a tu servicio en Render
2. Click en "Environment"
3. Agrega las siguientes variables:

   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URL=tu_url_de_mongodb_atlas
   JWT_SECRET=tu_jwt_secret
   ```

---

## Verificación Post-Despliegue

1. **Verifica el health check:**
   ```
   https://tu-app.onrender.com/health
   ```

2. **Verifica la conexión a MongoDB:**
   - Revisa los logs en Render Dashboard
   - Deberías ver: `✅ MongoDB connected successfully`

3. **Verifica el frontend:**
   - Abre la URL de tu servicio
   - Deberías ver la aplicación React

---

## Notas Importantes

1. **MongoDB Atlas:**
   - Asegúrate de que tu IP esté permitida en MongoDB Atlas (Network Access)
   - O mejor aún, permite acceso desde cualquier IP (`0.0.0.0/0`) para Render

2. **CORS:**
   - El backend ya tiene CORS configurado
   - Si tienes problemas, verifica que el origen del frontend esté permitido

3. **Variables de Entorno:**
   - **NUNCA** subas archivos `.env` al repositorio
   - Usa las variables de entorno de Render para valores sensibles

4. **Build Time:**
   - El build puede tardar varios minutos la primera vez
   - Render tiene un timeout de 20 minutos para builds gratuitos

5. **Sleep en Plan Gratuito:**
   - El plan gratuito de Render "duerme" después de 15 minutos de inactividad
   - La primera petición después de dormir puede tardar ~30 segundos en responder

---

## Troubleshooting

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el build command instale todas las dependencias

### Error: "MongoDB connection failed"
- Verifica que `MONGO_URL` esté correctamente configurada en Render
- Verifica que tu IP esté permitida en MongoDB Atlas
- Revisa los logs en Render para ver el error específico

### Frontend no carga
- Verifica que el build del frontend se complete correctamente
- Verifica que el path en `app.use(express.static(...))` sea correcto
- Revisa los logs del servidor en Render

### 404 en rutas del frontend
- Asegúrate de que el catch-all route (`app.get('*', ...)`) esté después de las rutas de API
- Verifica que el archivo `index.html` esté en `client/build/`
