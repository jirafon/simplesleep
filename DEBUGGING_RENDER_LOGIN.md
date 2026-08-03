# Guía de Depuración: Problema de Login en Render

## Problema
En Render, al intentar hacer login, recibes el error: "invalid response from server" y no aparecen logs útiles.

## Causa probable
El backend en Render tarda en "calentar" (arrancar) después del deployment. Cuando el frontend intenta conectarse inmediatamente, el backend no está listo y responde incorrectamente.

## Soluciones implementadas

### 1. Reintentos con Espera Exponencial (Cliente)
La función de login ahora intenta conectarse hasta 3 veces con esperas exponenciales:
- Intento 1: Inmediato
- Intento 2: Espera 1 segundo
- Intento 3: Espera 2 segundos

Esto permite que el servidor tenga tiempo de arrancar.

### 2. Logs Detallados en el Cliente
Ahora verás logs como:
```
📍 API Mode: PRODUCTION (using relative URLs)
🔗 API Call: https://your-backend.onrender.com/api/auth/login
🔐 Login attempt 1/3
📤 Request: POST https://your-backend.onrender.com/api/auth/login
...
✅ Login successful
```

Abre la consola del navegador (F12 > Console) para ver estos logs.

### 3. Logs en el Servidor
El servidor ahora registra todos los requests:
```
📨 2025-01-26T10:30:00Z | POST /api/auth/login | IP: 203.0.113.1
🔐 Login attempt: { email: 'user@example.com', hasPassword: true }
✅ Password match confirmed for user: user@example.com
📤 2025-01-26T10:30:00Z | POST /api/auth/login | Status: 200
```

Ve a Render Dashboard > Logs del servicio backend para ver estos logs.

## Cómo depurar en Render

### Paso 1: Verifica los logs del servidor
1. Abre Render Dashboard: https://dashboard.render.com
2. Selecciona tu servicio backend
3. Ve a la sección "Logs"
4. Intenta hacer login e inmediatamente revisa los logs

**Qué buscar:**
- Si ves `📨 POST /api/auth/login`, el request llegó al servidor
- Si ves `❌ MongoDB connection error:`, la BD no está conectada
- Si NO ves ningún log, el servidor aún no arrancó

### Paso 2: Verifica los logs del cliente
1. Abre tu aplicación en Render: https://your-frontend.onrender.com
2. Abre Developer Tools (F12)
3. Ve a la pestaña "Console"
4. Intenta hacer login
5. Revisa los logs

**Qué buscar:**
- `🔐 Login attempt 1/3, 2/3, 3/3` → Intento de login
- `📤 Request: POST` → Request enviado
- `❌ No response received` → Servidor no respondió (no arrancó aún)
- `✅ Login successful` → Éxito

### Paso 3: Verifica la variable de entorno `REACT_APP_BASE_URL`
En Render, para el servicio frontend, verifica que `REACT_APP_BASE_URL` apunte correctamente al backend:

**Ejemplo:**
```
REACT_APP_BASE_URL=https://siempresalud-server.onrender.com
```

**Importante:** 
- NO incluyas `/api` al final
- Asegúrate que uses HTTPS (no HTTP)
- Verifica que sea la URL correcta de tu backend

## Qué esperar después de hacer login

### En los logs del cliente verás:
```
🔐 Login attempt 1/3
📤 Request: POST https://your-backend.onrender.com/api/auth/login
⏳ Retrying in 1000ms...
🔐 Login attempt 2/3
📤 Request: POST https://your-backend.onrender.com/api/auth/login
✅ Login response received
✅ Login successful
```

### En los logs del servidor verás:
```
📨 POST /api/auth/login
🔐 Login attempt: { email: 'user@example.com', hasPassword: true }
✅ User found: { id: 123..., email: 'user@example.com' }
✅ Password match confirmed for user: user@example.com
✅ Login successful for user: user@example.com
```

## Próximos pasos

1. **Después del deployment en Render:**
   - Espera 30-60 segundos para que el backend arrange completamente
   - Abre la consola del navegador (F12 > Console)
   - Intenta hacer login
   - Revisa los logs

2. **Si aún falla:**
   - Verifica que `REACT_APP_BASE_URL` esté correctamente definido en Render
   - Verifica que MONGODB_URI esté correcto en el backend
   - Revisa los logs del servidor en Render

3. **Para optimizar:**
   - Considera aumentar la cantidad de reintentos si el backend tarda más
   - Modifica `maxRetries` en `client/src/context/AuthContext.js` en la función `login`

## Archivos modificados

- `client/src/context/AuthContext.js` - Añadida lógica de reintentos
- `client/src/config/api.js` - Añadidos logs de configuración
- `client/src/utils/axiosInterceptor.js` - Nuevo archivo con interceptor
- `client/src/App.js` - Inicializa el interceptor
- `server/server.js` - Añadido middleware de logging

## Contacto

Si el problema persiste después de estos pasos, revisa los logs completos en Render y asegúrate que:
1. El backend esté corriendo (status "Live" en Render)
2. MongoDB esté accesible
3. Las variables de entorno estén correctamente configuradas
