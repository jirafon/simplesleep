# 🚀 Configuración de Render para Siempresalud

## ⚙️ Configuración del Servicio Backend

### Nombre del Servicio
**`siempresalud-server`**

URL resultante: `https://siempresalud-server.onrender.com`

### Configuración en Render Dashboard

1. **Ir a:** https://dashboard.render.com
2. **Seleccionar:** Tu servicio existente o crear uno nuevo
3. **Nombre del servicio:** `siempresalud-server`

### Settings → Build & Deploy

**Environment:** `Node`

**Build Command:**
```bash
cd server && npm install --legacy-peer-deps && cd ../client && npm install --legacy-peer-deps && npm run build && cd ../server && mkdir -p public && cp -r ../client/build/* public/ && ls -la public/ | head -20
```

**Start Command:**
```bash
cd server && node index.js
```

**Root Directory:** (dejar vacío)

### Settings → Environment

Variables de entorno requeridas:

```bash
NODE_ENV=production
PORT=10000
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/siempresalud?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres
```

**Variables opcionales:**
```bash
MAILGUN_API_KEY=tu_mailgun_key
MAILGUN_DOMAIN=tu_dominio
MAILGUN_FROM_EMAIL=noreply@tudominio.com
OPEN_API_KEY=sk-tu_openai_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu_bucket
```

### Settings → Health Check

**Health Check Path:** `/health`

### Settings → Auto-Deploy

**Auto-Deploy:** ✅ Enabled (Yes)

Esto hará que cada push a `main` desencadene un redeploy automático.

---

## 🌐 Verificación Post-Deploy

Una vez desplegado, verifica que todo funcione:

### 1. Health Check
```bash
curl https://siempresalud-server.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-03-04T..."
}
```

### 2. Login Test
```bash
./server/scripts/testRenderLogin.sh
```

O manualmente:
```bash
curl -X POST https://siempresalud-server.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"romerino@gmail.com","password":"123456"}'
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Roberto Merino",
    "email": "romerino@gmail.com",
    "userprofile": "admin"
  }
}
```

### 3. Frontend Test

Si tienes el frontend desplegado, abre:
```
https://siempresalud-server.onrender.com
```

El frontend debe cargarse correctamente desde `server/public`.

---

## 🔧 Solución de Problemas

### El usuario no existe en producción

Si el login devuelve 401 pero funciona localmente:

```bash
# Conectar a MongoDB de producción y crear/resetear usuario
MONGO_URL="tu_mongodb_atlas_url" node server/scripts/checkRenderUser.js
```

### Ver logs en tiempo real

En Render Dashboard:
1. Selecciona tu servicio `siempresalud-server`
2. Click en tab "Logs"
3. Los logs se actualizan automáticamente

### Forzar redeploy

Si algo no funciona:
1. En Render Dashboard → tu servicio
2. Click "Manual Deploy" → "Deploy latest commit"
3. Espera 5-10 minutos

---

## 📝 Checklist de Configuración

- [ ] Servicio creado en Render con nombre `siempresalud-server`
- [ ] Variables de entorno configuradas (NODE_ENV, MONGO_URL, JWT_SECRET)
- [ ] MongoDB Atlas configurado y accesible
- [ ] IP de Render agregada a MongoDB Atlas Network Access (o usar 0.0.0.0/0)
- [ ] Health check en `/health` configurado
- [ ] Auto-deploy habilitado
- [ ] Primer deploy exitoso
- [ ] Health check responde correctamente
- [ ] Login funciona con usuario de prueba
- [ ] Frontend se carga desde server/public

---

## 🌍 URLs Importantes

- **Backend API:** https://siempresalud-server.onrender.com
- **Health Check:** https://siempresalud-server.onrender.com/health
- **Login Endpoint:** https://siempresalud-server.onrender.com/api/auth/login
- **Render Dashboard:** https://dashboard.render.com
- **GitHub Repo:** https://github.com/jirafon/siempresalud

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Ejecuta `testRenderLogin.sh` para diagnosticar
3. Lee [SOLUCION_RENDER_404.md](SOLUCION_RENDER_404.md) para problemas comunes
4. Lee [DEBUGGING_RENDER_LOGIN.md](DEBUGGING_RENDER_LOGIN.md) para problemas de login
