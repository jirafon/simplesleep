#!/bin/bash

echo "🧪 Prueba de Login en Render para romerino@gmail.com"
echo "======================================================="
echo ""

# Configuración
RENDER_URL="${1:-https://siempresalud-server.onrender.com}"
EMAIL="romerino@gmail.com"
PASSWORD="123456"

echo "🌐 URL de Render: $RENDER_URL"
echo "📧 Email: $EMAIL"
echo "🔐 Password: $PASSWORD"
echo ""

# Función para probar un endpoint
test_endpoint() {
  local ENDPOINT=$1
  local URL="${RENDER_URL}${ENDPOINT}"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📍 Probando: $URL"
  echo ""
  
  RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X GET "$URL" -H "Accept: application/json")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n2 | head -n1)
  TIME=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d' | sed '$d')
  
  echo "📊 HTTP Code: $HTTP_CODE"
  echo "⏱️  Tiempo: ${TIME}s"
  echo "📦 Respuesta:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
}

# 1. Probar health endpoint
echo "═════════════════════════════════════════════════════"
echo "1️⃣  PROBANDO HEALTH ENDPOINT"
echo "═════════════════════════════════════════════════════"
test_endpoint "/health"

# 2. Probar que el servidor responde
echo "═════════════════════════════════════════════════════"
echo "2️⃣  PROBANDO RAÍZ DE API"
echo "═════════════════════════════════════════════════════"
test_endpoint "/api"

# 3. Probar login
echo "═════════════════════════════════════════════════════"
echo "3️⃣  PROBANDO LOGIN"
echo "═════════════════════════════════════════════════════"
echo "📍 URL: ${RENDER_URL}/api/auth/login"
echo "📤 Enviando credenciales..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X POST "${RENDER_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n2 | head -n1)
TIME=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d' | sed '$d')

echo "📊 HTTP Code: $HTTP_CODE"
echo "⏱️  Tiempo: ${TIME}s"
echo ""
echo "📦 Respuesta completa:"
echo "$BODY"
echo ""
echo "📦 Respuesta formateada (JSON):"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Análisis del resultado
echo "═════════════════════════════════════════════════════"
echo "📊 ANÁLISIS DEL RESULTADO"
echo "═════════════════════════════════════════════════════"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ LOGIN EXITOSO (HTTP 200)"
  
  TOKEN=$(echo "$BODY" | jq -r '.token' 2>/dev/null)
  if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Token recibido: ${TOKEN:0:30}..."
    echo "✅ El backend está funcionando correctamente"
  else
    echo "⚠️  HTTP 200 pero sin token en la respuesta"
    echo "⚠️  Estructura de respuesta incorrecta"
  fi
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ LOGIN FALLIDO (HTTP 401)"
  echo "⚠️  Credenciales incorrectas o usuario no existe"
  echo ""
  echo "💡 Soluciones:"
  echo "   1. Verifica que el usuario existe en MongoDB de producción"
  echo "   2. Ejecuta: node server/scripts/checkRomerinoUser.js"
  echo "   3. Si no existe, crea el usuario o ejecuta resetAllUsers.js"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ ERROR DEL SERVIDOR (HTTP 500)"
  echo "⚠️  Problema en el backend de Render"
  echo ""
  echo "💡 Soluciones:"
  echo "   1. Revisa los logs en Render Dashboard"
  echo "   2. Verifica que MONGO_URL esté correcta"
  echo "   3. Verifica que JWT_SECRET esté configurado"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ SIN RESPUESTA (HTTP 000)"
  echo "⚠️  El servidor no está respondiendo"
  echo ""
  echo "💡 Soluciones:"
  echo "   1. Verifica que el servidor esté desplegado en Render"
  echo "   2. Verifica la URL: $RENDER_URL"
  echo "   3. El servicio puede estar en modo sleep (Free tier)"
else
  echo "⚠️  RESPUESTA INESPERADA (HTTP $HTTP_CODE)"
  echo "⚠️  Revisa la respuesta completa arriba"
fi

echo ""
echo "═════════════════════════════════════════════════════"
echo "🔍 PRÓXIMOS PASOS"
echo "═════════════════════════════════════════════════════"
echo ""
echo "1. Revisa los logs en Render:"
echo "   https://dashboard.render.com"
echo ""
echo "2. Verifica las variables de entorno en Render:"
echo "   - MONGO_URL (debe apuntar a MongoDB Atlas de producción)"
echo "   - JWT_SECRET (debe estar configurado)"
echo "   - NODE_ENV=production"
echo ""
echo "3. Si el usuario no existe en producción, conéctate a MongoDB"
echo "   y ejecuta el script de reseteo:"
echo "   MONGO_URL=<tu-mongo-atlas-url> node server/scripts/resetAllUsers.js"
echo ""
