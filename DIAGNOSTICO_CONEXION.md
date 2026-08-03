# 🔍 Diagnóstico: Frontend No Conecta con Backend en Render

## Problema

No ves logs en el servidor cuando el frontend hace llamadas, lo que sugiere que el frontend NO está apuntando correctamente al backend.

---

## 🧪 Diagnóstico Rápido - Opción 1: Desde el Navegador

### 1. Abre tu app en Render

```
https://siempresalud-server.onrender.com
```

### 2. Abre la Consola del Navegador

- **Chrome/Edge:** F12 o Ctrl+Shift+J (Cmd+Option+J en Mac)
- **Firefox:** F12 o Ctrl+Shift+K (Cmd+Option+K en Mac)
- **Safari:** Cmd+Option+C

### 3. Busca estos logs

Deberías ver al cargar la página:

```
🔧 ========== API CONFIGURATION ==========
📍 Current URL: https://...
📍 NODE_ENV: production
📍 REACT_APP_BASE_URL: NOT SET
📍 Computed API_BASE_URL: (relative paths)
📍 Example API call: /api/auth/login (relative)
📍 Will resolve to: https://siempresalud-server.onrender.com/api/auth/login
=========================================
```

**💡 INTERPRETACIÓN:**

#### ✅ CORRECTO (Opción A - Un solo servicio):
```
REACT_APP_BASE_URL: NOT SET
Computed API_BASE_URL: (relative paths)
Will resolve to: https://siempresalud-server.onrender.com/api/auth/login
```
✅ El frontend usa URLs relativas y apunta al mismo dominio donde está.

#### ⚠️ INCORRECTO (Si ves esto en Opción A):
```
REACT_APP_BASE_URL: https://siempresalud-server.onrender.com
Computed API_BASE_URL: https://siempresalud-server.onrender.com
```
❌ Tienes `REACT_APP_BASE_URL` configurada cuando NO debería estarlo (Opción A).

---

## 🧪 Diagnóstico Rápido - Opción 2: Código en Consola

### Copia y pega esto en la consola del navegador:

```javascript
// Diagnóstico rápido
console.log('🔍 URL actual:', window.location.href);
console.log('📍 REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL || 'NOT SET ✅');
console.log('📍 Probando /health...');

fetch('/health')
  .then(r => r.json())
  .then(d => console.log('✅ /health responde:', d))
  .catch(e => console.error('❌ /health error:', e.message));

fetch('https://siempresalud-server.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend directo responde:', d))
  .catch(e => console.error('❌ Backend directo error:', e.message));
```

**💡 INTERPRETACIÓN:**

#### ✅ CORRECTO:
```
REACT_APP_BASE_URL: NOT SET ✅
✅ /health responde: {status: "ok", mongodb: "connected", ...}
✅ Backend directo responde: {status: "ok", mongodb: "connected", ...}
```
**Ambos deben responder igual** (mismo servidor).

#### ❌ PROBLEMA 1: Frontend separado
```
REACT_APP_BASE_URL: NOT SET ✅
❌ /health error: Failed to fetch
✅ Backend directo responde: {status: "ok", ...}
```
**Significa:** Tu frontend está en un dominio diferente (servicio separado).
**Solución:** Configura `REACT_APP_BASE_URL` o usa Opción A.

#### ❌ PROBLEMA 2: Backend no responde
```
❌ /health error: 404 Not Found
❌ Backend directo error: 404 Not Found
```
**Significa:** El backend no está funcionando o no está en esa URL.
**Solución:** Verifica el deploy en Render.

---

## 🧪 Diagnóstico - Opción 3: Agregar Panel Visual

Agrega temporalmente el componente de diagnóstico a tu app:

### 1. Abre: `client/src/pages/Login.jsx` (o cualquier página)

### 2. Agrega al inicio:
```jsx
import DiagnosticPanel from '../components/DiagnosticPanel';
```

### 3. Agrega en el JSX (antes del return):
```jsx
return (
  <div>
    <DiagnosticPanel />
    {/* resto del código */}
  </div>
);
```

### 4. Guarda, haz commit y redeploy

Verás un panel flotante con toda la información de diagnóstico.

---

## 🔧 Soluciones Según el Problema

### PROBLEMA: REACT_APP_BASE_URL está configurada (pero no debería)

**En Render Dashboard:**

1. Ve a tu servicio → Settings → Environment
2. Busca `REACT_APP_BASE_URL`
3. **ELIMÍNALA** (click en la X)
4. Guardar cambios
5. Forzar redeploy (Manual Deploy → "Deploy latest commit")

**Por qué:** En Opción A (un solo servicio), el frontend NO necesita esta variable. Usa URLs relativas automáticamente.

---

### PROBLEMA: Frontend está en servicio separado (Static Site)

**Tienes dos opciones:**

#### Opción A: Migrar a un solo servicio (RECOMENDADO)

1. **Elimina** el servicio Static Site del frontend en Render
2. Asegúrate que `siempresalud-server` tenga el build command correcto:
   ```bash
   cd server && npm install --legacy-peer-deps && cd ../client && npm install --legacy-peer-deps && npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/
   ```
3. Redeploy
4. El frontend estará en la misma URL que el backend

#### Opción B: Configurar servicios separados correctamente

1. En el servicio **frontend** (Static Site) → Settings → Environment
2. Agregar:
   ```
   REACT_APP_BASE_URL=https://siempresalud-server.onrender.com
   ```
3. **Sin `/api` al final, sin slash final**
4. Redeploy el frontend

---

### PROBLEMA: Backend no responde a /health

**Verifica en Render:**

1. Dashboard → `siempresalud-server` → Logs
2. Busca:
   ```
   🚀 Server is running on port 10000
   ✅ MongoDB connected
   ```
3. Si no ves esto, el servidor no arrancó correctamente

**Posibles causas:**
- ❌ MONGO_URL incorrecta o inaccesible
- ❌ JWT_SECRET no configurado
- ❌ Error en el build
- ❌ Puerto incorrecto

**Solución:**
1. Verifica variables de entorno en Settings → Environment
2. Verifica los logs completos del deploy
3. Forzar redeploy

---

## ✅ Checklist de Verificación

Ejecuta estos checks:

### 1. Verifica Variables de Entorno en Render

**Para Opción A (un solo servicio):**
- [ ] `NODE_ENV=production` ✅
- [ ] `PORT=10000` ✅
- [ ] `MONGO_URL=mongodb+srv://...` ✅
- [ ] `JWT_SECRET=...` ✅
- [ ] `REACT_APP_BASE_URL` NO debe existir ❌

### 2. Verifica Build Command

Debe incluir:
```bash
&& npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/
```

### 3. Verifica Start Command

```bash
cd server && node index.js
```

### 4. Verifica en Logs del Server

Cuando arranca debe mostrar:
```
✅ Serving static files from: /opt/render/project/src/server/public
```

Si NO ves esto, el frontend no se copió a `server/public`.

---

## 🧪 Test Final

Una vez corregido, ejecuta:

```bash
# Desde tu computadora
./server/scripts/testRenderLogin.sh
```

Debe mostrar:
```
✅ LOGIN EXITOSO (HTTP 200)
✅ Token recibido
```

Y en los **Logs de Render** debes ver:
```
🚨 ========== LOGIN ROUTE HIT ==========
🔐 Login attempt: { email: 'romerino@gmail.com', hasPassword: true }
```

Si ves esto → ✅ El frontend está conectado correctamente al backend.

---

## 📞 Necesitas Ayuda?

Comparte:
1. Screenshot de la consola del navegador (con los logs de API CONFIGURATION)
2. Screenshot de Environment Variables en Render
3. Los últimos 50 líneas de logs del deploy en Render
