# 🔧 Solución: Login no funciona en Render (404 en todas las rutas)

## 🔍 Diagnóstico

Al probar el servidor en Render con `testRenderLogin.sh`, **todas las rutas devuelven HTTP 404**:
- ❌ `/health` → 404
- ❌ `/api` → 404
- ❌ `/api/auth/login` → 404

Esto significa que el servidor está corriendo, pero **las rutas no están configuradas correctamente**.

## 🎯 Causas Posibles

### 1. **Build incompleto en Render** (Más probable)
El archivo `index.js` no se está ejecutando correctamente o hay un error durante el build.

### 2. **Problema con el comando de inicio**
El comando `startCommand` en `render.yaml` puede no estar apuntando al directorio correcto.

### 3. **Variables de entorno faltantes**
Si falta `MONGO_URL` y el servidor no inicia correctamente.

## ✅ Soluciones

### Solución 1: Verificar el Build Command en Render

Edita el servicio en Render Dashboard y asegúrate de que:

**Build Command:**
```bash
cd server && npm install --legacy-peer-deps && cd ../client && npm install --legacy-peer-deps && npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/ && ls -la public/ | head -20
```

**Start Command:**
```bash
cd server && node index.js
```

**Root Directory:** (dejar vacío)

### Solución 2: Verificar Variables de Entorno

En Render Dashboard → Environment, verifica que existan:

```bash
NODE_ENV=production
PORT=10000
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
```

**IMPORTANTE:** `MONGO_URL` debe ser una URL válida de MongoDB Atlas (no localhost).

### Solución 3: Usar el script de build simplificado

Actualiza `render.yaml` para usar `build-for-render.sh`:

```yaml
services:
  - type: web
    name: doctor911-backend
    env: node
    plan: starter
    buildCommand: ./build-for-render.sh
    startCommand: cd server && node index.js
    envVars:
      - key: NODE_ENV
        value: production
```

Después haz commit y push:
```bash
git add render.yaml
git commit -m "fix: Update Render build configuration"
git push origin main
```

### Solución 4: Verificar los Logs en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio `doctor911-backend`
3. Click en "Logs"
4. Busca errores durante el inicio:
   - ❌ `MongoDB connection error`
   - ❌ `Error loading .env`
   - ❌ `Cannot find module`
   - ❌ `ENOENT: no such file`

### Solución 5: Forzar Redeploy

A veces Render necesita un redeploy manual:

1. En Render Dashboard → tu servicio
2. Click en "Manual Deploy" → "Deploy latest commit"
3. Espera 5-10 minutos
4. Ve a Logs para ver el proceso de build

### Solución 6: Verificar el Working Directory

El problema puede ser que Render no está ejecutando los comandos desde el directorio correcto.

**Actualiza `render.yaml`:**

```yaml
services:
  - type: web
    name: doctor911-backend
    env: node
    plan: starter
    buildCommand: |
      echo "📂 Current directory: $(pwd)"
      echo "📂 Listing files:"
      ls -la
      cd server
      npm install --legacy-peer-deps
      cd ../client
      npm install --legacy-peer-deps
      npm run build
      cd ../server
      mkdir -p public
      cp -r ../client/build/* public/
      echo "✅ Build files copied"
      ls -la public/ | head -10
    startCommand: cd server && node index.js
    rootDirectory: .
```

## 🧪 Verificación Después de Aplicar la Solución

Una vez hayas aplicado las soluciones, prueba:

```bash
# Probar desde tu computadora
./server/scripts/testRenderLogin.sh

# O con curl directo
curl https://doctor911-backend.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-03-04T..."
}
```

## 📊 Comando de Diagnóstico Completo

Para ver qué está pasando en Render, agrega logs al inicio de `server/index.js`:

```javascript
console.log('\n🚀 ========== SERVER STARTING ==========');
console.log('📂 Current directory:', __dirname);
console.log('📂 Process cwd:', process.cwd());
console.log('📂 Directory contents:');
const fs = require('fs');
fs.readdirSync(__dirname).forEach(file => {
  console.log('   -', file);
});
console.log('=======================================\n');
```

Esto te ayudará a ver si el servidor está en el directorio correcto.

## 🆘 Si Todo Falla

Si después de todo esto sigue sin funcionar:

1. **Crea un servicio nuevo en Render desde cero**
2. **Usa la configuración simplificada:**

**Root Directory:** `server`

**Build Command:**
```bash
npm install --legacy-peer-deps
```

**Start Command:**
```bash
node index.js
```

**Environment:**
```
NODE_ENV=production
MONGO_URL=tu_mongo_atlas_url
JWT_SECRET=tu_secreto
```

3. **NO intentes servir el frontend desde el backend**. Despliega el frontend por separado como Static Site.

## 📞 Contacto

Si necesitas ayuda adicional, revisa:
- [Documentación de Render](https://render.com/docs)
- [Logs en tiempo real en Render Dashboard](https://dashboard.render.com)
