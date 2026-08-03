#!/bin/bash

echo "🧪 Prueba de Login para romerino@gmail.com"
echo "==========================================="
echo ""

# Configuración
SERVER_URL="${1:-http://localhost:5000}"
EMAIL="romerino@gmail.com"
PASSWORD="123456"

echo "🌐 URL del servidor: $SERVER_URL"
echo "📧 Email: $EMAIL"
echo "🔐 Password: $PASSWORD"
echo ""
echo "🚀 Enviando solicitud..."
echo ""

# Hacer la solicitud de login
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Separar el cuerpo y el código de estado
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 Código HTTP: $HTTP_CODE"
echo ""
echo "📦 Respuesta:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Verificar resultado
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ LOGIN EXITOSO"
  
  # Extraer token si existe
  TOKEN=$(echo "$BODY" | jq -r '.token' 2>/dev/null)
  if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "🎟️  Token obtenido: ${TOKEN:0:50}..."
  fi
else
  echo "❌ LOGIN FALLIDO"
  echo "⚠️  Revisa los logs del servidor o verifica las credenciales"
fi
