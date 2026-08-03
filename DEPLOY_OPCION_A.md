# 🚀 Pasos para Desplegar con OPCIÓN A (Un Solo Servicio)

## ✅ Configuración Actual

- Repositorio: `jirafon/siempresalud`
- Commit más reciente: `d2ab3e8`
- Backend sirve frontend desde `server/public`
- Todo en: `https://siempresalud-server.onrender.com`

---

## 📋 CHECKLIST - Sigue estos pasos en orden

### 1️⃣ Eliminar Servicio Frontend Separado (si existe)

**En Render Dashboard:**

1. Ve a https://dashboard.render.com
2. Busca si existe un servicio llamado `siempresalud-frontend` o `doctor911-frontend`
3. Si existe:
   - Click en el servicio
   - Settings (abajo a la izquierda)
   - Scroll hasta el final
   - Click "Delete Service"
   - Confirmar

✅ **Solo debes tener UN servicio llamado `siempresalud-server`**

---

### 2️⃣ Configurar el Servicio Backend

**En Render Dashboard → Servicios:**

#### Si YA TIENES un servicio:

1. Click en tu servicio existente (cualquiera de estos nombres):
   - `doctor911-backend`
   - `siempresalud-server`
   - O el nombre que tengas

2. **Settings → Service Details:**
   - Change name to: `siempresalud-server` (si no lo está ya)
   - Save

#### Si NO TIENES ningún servicio:

1. Click "New +" → "Web Service"
2. Connect repository: `jirafon/siempresalud`
3. Name: `siempresalud-server`
4. Continue

---

### 3️⃣ Configurar Build & Deploy

**Settings → Build & Deploy:**

**Environment:** `Node`

**Root Directory:** (dejar VACÍO)

**Build Command:** (copiar esto completo)
```bash
cd server && npm install --legacy-peer-deps && cd ../client && npm install --legacy-peer-deps && npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/ && echo "✅ Frontend copied to server/public"
```

**Start Command:**
```bash
cd server && node index.js
```

**Auto-Deploy:** `Yes` ✅

**Branch:** `main`

💾 **Guardar cambios**

---

### 4️⃣ Configurar Variables de Entorno

**Settings → Environment:**

Agrega estas variables (click "Add Environment Variable"):

```bash
Key: NODE_ENV
Value: production

Key: PORT
Value: 10000

Key: MONGO_URL
Value: mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/siempresalud?retryWrites=true&w=majority

Key: JWT_SECRET
Value: tu_clave_secreta_super_larga_y_segura_minimo_32_caracteres_12345678
```

**Opcional (si los usas):**
```bash
Key: MAILGUN_API_KEY
Value: tu_mailgun_key

Key: MAILGUN_DOMAIN
Value: tu_dominio

Key: OPEN_API_KEY
Value: sk-tu_openai_key

Key: AWS_REGION
Value: us-east-1

Key: AWS_S3_BUCKET_NAME
Value: tu_bucket
```

⚠️ **IMPORTANTE:** NO agregues `REACT_APP_BASE_URL` (debe quedar sin configurar)

💾 **Guardar cambios**

---

### 5️⃣ Configurar Health Check

**Settings → Health & Alerts:**

**Health Check Path:** `/health`

💾 **Guardar**

---

### 6️⃣ Lanzar el Deploy

**En la página principal del servicio:**

1. Click botón **"Manual Deploy"** (arriba a la derecha)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**

⏳ **Espera 5-10 minutos** mientras Render:
- Instala dependencias del servidor
- Instala dependencias del cliente
- Construye el frontend React
- Copia el build a `server/public`
- Inicia el servidor

---

### 7️⃣ Monitorear el Deploy

**Ve a la pestaña "Logs"** y busca:

```
Step 1: Install server dependencies
✅ Done

Step 2: Install client dependencies
✅ Done

Step 3: Build React app
✅ Done

Step 4: Copy build to server/public
✅ Done

Step 5: Verify build
✅ Build successful

🚀 ========== SERVER STARTING ==========
📂 __dirname: /opt/render/project/src/server
📍 Registering API routes...
✅ API routes registered
✅ MongoDB connected successfully
✅ Serving static files from: /opt/render/project/src/server/public
🚀 Server is running on port 10000
```

✅ **Si ves todo esto, el deploy fue exitoso!**

---

### 8️⃣ Verificar que Funciona

Una vez que veas "Deploy live" en verde:

#### A. Verificar Health Check

Abre en tu navegador:
```
https://siempresalud-server.onrender.com/health
```

**Debe mostrar:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-03-04T..."
}
```

#### B. Verificar Frontend

Abre:
```
https://siempresalud-server.onrender.com
```

**Debe cargar la página de Siempresalud** (no error 404)

#### C. Verificar Login (desde tu computadora)

```bash
cd /Users/mnacbook/dev/siempresalud
./server/scripts/testRenderLogin.sh
```

**Debe mostrar:**
```
✅ LOGIN EXITOSO (HTTP 200)
✅ Token recibido
```

#### D. Probar Login desde el Navegador

1. Abre `https://siempresalud-server.onrender.com`
2. Click en "Iniciar Sesión" o navega a `/login`
3. Abre la consola (F12 → Console)
4. Intenta login con:
   - Email: `romerino@gmail.com`
   - Password: `123456`

**En la consola debes ver:**
```
📍 API Mode: SAME DOMAIN (production)
   Using relative URLs
🔗 API Call (relative): /api/auth/login
```

**Si todo funciona:** ✅ Verás "Login exitoso" y serás redirigido a `/bitacora`

---

## 🔧 Si Algo Sale Mal

### Problema 1: Build falla - "index.html not found"

**Causa:** El frontend no se construyó o no se copió correctamente

**Solución:**
1. Verifica en los logs que todos los pasos (1-5) se completaron
2. Si hay error en "Step 3: Build React app", revisa que `client/package.json` tenga el script `build`
3. Si hay error en "Step 4: Copy build", verifica que la ruta sea correcta

### Problema 2: Frontend carga pero login da 404

**Causa:** MongoDB no está conectado o las rutas no se registraron

**Solución:**
1. Revisa los logs: busca "✅ MongoDB connected"
2. Si dice "MongoDB connection error", verifica `MONGO_URL`
3. Verifica que `JWT_SECRET` esté configurado

### Problema 3: Login da 401 - "Credenciales inválidas"

**Causa:** Usuario no existe en la base de datos de producción

**Solución:**
```bash
# En tu computadora
MONGO_URL="tu_mongodb_atlas_url_de_produccion" node server/scripts/checkRenderUser.js
```

Este script creará el usuario si no existe.

### Problema 4: Frontend carga pero dice "Cannot GET /api/..."

**Causa:** El frontend no está siendo servido correctamente

**Solución:**
1. Verifica en logs: "✅ Serving static files from: ..."
2. Si no ves este mensaje, el `server/public` no existe
3. Redeploy manualmente

---

## ✅ Checklist Final

- [ ] Solo existe el servicio `siempresalud-server` (frontend separado eliminado)
- [ ] Build Command correcto (incluye build de React y copia a public)
- [ ] Start Command: `cd server && node index.js`
- [ ] Variables de entorno configuradas (NODE_ENV, PORT, MONGO_URL, JWT_SECRET)
- [ ] NO hay variable `REACT_APP_BASE_URL` configurada
- [ ] Health Check configurado en `/health`
- [ ] Deploy completado exitosamente
- [ ] `/health` responde con JSON
- [ ] Frontend carga en la raíz
- [ ] Login funciona (o usuario creado en MongoDB de producción)

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu aplicación está funcionando en:

🌐 **https://siempresalud-server.onrender.com**

- Frontend: Mismo dominio raíz
- API: Mismo dominio `/api/*`
- Sin problemas de CORS
- Todo en un solo servicio

---

## 📞 Necesitas Ayuda?

Si algo no funciona:
1. Copia los logs de Render (desde el inicio del deploy hasta el error)
2. Captura screenshot de las variables de entorno
3. Comparte para ayudarte a diagnosticar
