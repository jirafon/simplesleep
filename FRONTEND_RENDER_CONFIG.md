# 🌐 Configuración del Frontend en Render

## ⚠️ DOS OPCIONES DE DESPLIEGUE

Tienes **dos maneras** de desplegar el frontend en Render:

---

## 🎯 OPCIÓN 1: Backend Sirve el Frontend (RECOMENDADO)

**Ventaja:** Un solo servicio, más simple, sin problemas de CORS.

### Cómo funciona:
- El backend construye el frontend en `server/public`
- El backend sirve tanto la API (`/api/*`) como el frontend (`/*`)
- Todo en un solo dominio: `https://siempresalud-server.onrender.com`

### Configuración en Render:

#### 1. Servicio: `siempresalud-server` (Web Service)

**Environment:** Node

**Build Command:**
```bash
cd server && npm install --legacy-peer-deps && cd ../client && npm install --legacy-peer-deps && npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/
```

**Start Command:**
```bash
cd server && node index.js
```

**Environment Variables:**
```bash
NODE_ENV=production
PORT=10000
MONGO_URL=tu_mongodb_url
JWT_SECRET=tu_secreto
# NO configurar REACT_APP_BASE_URL (usa URLs relativas)
```

### ✅ Verificación:

```bash
# Frontend
curl https://siempresalud-server.onrender.com

# API
curl https://siempresalud-server.onrender.com/api/health
```

**Ambos deben responder desde el mismo dominio.**

---

## 🔄 OPCIÓN 2: Frontend y Backend Separados

**Ventaja:** Escalado independiente, redeploys más rápidos.
**Desventaja:** Más complejo, requiere configuración de CORS.

### Cómo funciona:
- Frontend Static Site: `https://siempresalud-frontend.onrender.com`
- Backend Web Service: `https://siempresalud-server.onrender.com`
- El frontend hace llamadas al backend usando URLs absolutas

### Configuración en Render:

#### 1. Servicio Backend: `siempresalud-server` (Web Service)

**Environment:** Node

**Build Command:**
```bash
cd server && npm install --legacy-peer-deps
```

**Start Command:**
```bash
cd server && node index.js
```

**Environment Variables:**
```bash
NODE_ENV=production
PORT=10000
MONGO_URL=tu_mongodb_url
JWT_SECRET=tu_secreto
```

#### 2. Servicio Frontend: `siempresalud-frontend` (Static Site)

**Environment:** Static Site

**Build Command:**
```bash
cd client && npm install --legacy-peer-deps && npm run build
```

**Publish Directory:**
```
client/build
```

**Environment Variables (⚠️ CRÍTICO):**
```bash
REACT_APP_BASE_URL=https://siempresalud-server.onrender.com
```

**Sin `/api` al final, sin slash final.**

### ✅ Verificación:

```bash
# Frontend (debe cargar la app)
curl https://siempresalud-frontend.onrender.com

# Backend (debe responder JSON)
curl https://siempresalud-server.onrender.com/health

# Login desde frontend debe apuntar a backend
# Abre la consola del navegador y verás:
# 📍 API Mode: SEPARATE SERVICES
# 🔗 API Call: https://siempresalud-server.onrender.com/api/auth/login
```

---

## 🔍 Diagnóstico: ¿Qué opción estás usando?

### En Render Dashboard:

1. Ve a https://dashboard.render.com
2. Lista tus servicios

**Si ves:**
- ✅ **Solo `siempresalud-server`** → Estás usando OPCIÓN 1 (correcto)
- ⚠️ **`siempresalud-server` Y `siempresalud-frontend`** → Estás usando OPCIÓN 2

### Si usas OPCIÓN 1 y el frontend no carga:

**Problema común:** El build no copió los archivos a `server/public`

**Solución:**
1. En Render Dashboard → `siempresalud-server`
2. Settings → Build & Deploy
3. Verifica que el Build Command incluya:
   ```bash
   && cp -r ../client/build/* public/
   ```
4. Forzar redeploy: Manual Deploy → "Deploy latest commit"
5. Revisar logs del build para ver si `public/index.html` existe

### Si usas OPCIÓN 2 y el frontend no conecta con el backend:

**Problema común:** `REACT_APP_BASE_URL` no está configurada

**Solución:**
1. En Render Dashboard → `siempresalud-frontend` (Static Site)
2. Environment
3. Agregar:
   ```
   Key: REACT_APP_BASE_URL
   Value: https://siempresalud-server.onrender.com
   ```
4. **SIN `/api` al final, SIN slash final**
5. Redeploy el frontend (cambiar env vars requiere rebuild)

---

## 🧪 Prueba de Configuración

Una vez desplegado, abre tu app en Render y:

### 1. Abre la consola del navegador (F12 → Console)

Deberías ver:
```
📍 API Mode: SAME DOMAIN
   Using relative URLs
```
O:
```
📍 API Mode: SEPARATE SERVICES
   REACT_APP_BASE_URL: https://siempresalud-server.onrender.com
   Using absolute URLs
```

### 2. Intenta hacer login

En la consola verás:
```
🔗 API Call: /api/auth/login  (OPCIÓN 1)
```
O:
```
🔗 API Call: https://siempresalud-server.onrender.com/api/auth/login  (OPCIÓN 2)
```

### 3. Si aparece error:

**Network Error o CORS:**
- OPCIÓN 1: El backend no está sirviendo el frontend
- OPCIÓN 2: `REACT_APP_BASE_URL` no está configurada o es incorrecta

**404 Not Found:**
- Backend no está corriendo o la ruta no existe
- Ejecuta: `./server/scripts/testRenderLogin.sh`

**401 Unauthorized:**
- ✅ El frontend SÍ conecta con el backend (esto es correcto)
- ❌ El usuario no existe o la contraseña es incorrecta
- Solución: Ejecuta `MONGO_URL=tu_url node server/scripts/checkRenderUser.js`

---

## 📋 Recomendación

**USA OPCIÓN 1** (backend sirve el frontend) porque:
- ✅ Más simple
- ✅ Sin problemas de CORS
- ✅ Un solo dominio
- ✅ Un solo servicio (gratis en Render)
- ✅ Frontend y backend siempre sincronizados

**Usa OPCIÓN 2 solo si:**
- Necesitas escalar frontend y backend independientemente
- El frontend es muy pesado y necesita CDN
- Tienes múltiples frontends usando el mismo backend

---

## 🆘 Ayuda Adicional

Si después de seguir esta guía el frontend aún no conecta:

1. **Verifica los logs:**
   - Render Dashboard → Tu servicio → Logs
   
2. **Prueba el backend manualmente:**
   ```bash
   ./server/scripts/testRenderLogin.sh
   ```

3. **Revisa la consola del navegador:**
   - F12 → Console → busca los logs de `📍 API Mode`
   
4. **Verifica variables de entorno:**
   - Render Dashboard → Servicios → Environment
   - Screenshot y comparte si necesitas ayuda
