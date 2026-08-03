# Configuración de OpenAI para Análisis con IA

Este proyecto utiliza OpenAI (ChatGPT) para proporcionar análisis médico de los registros de pacientes.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env` en el directorio `server/`:

```env
# OpenAI Configuration
OPEN_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o-mini  # Opcional, por defecto usa gpt-4o-mini
```

## Cómo Obtener una API Key de OpenAI

1. Ve a https://platform.openai.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API keys" en el menú
4. Haz clic en "Create new secret key"
5. Copia la clave y agrégala a tu archivo `.env`

## Modelos Disponibles

- `gpt-4o-mini` (recomendado) - Más económico y rápido
- `gpt-4o` - Más potente pero más costoso
- `gpt-4-turbo` - Versión turbo de GPT-4
- `gpt-3.5-turbo` - Más económico pero menos potente

## Funcionalidad

El análisis con IA permite a los doctores:

1. **Seleccionar múltiples registros** de pacientes (máximo 10)
2. **Enviar los registros a ChatGPT** para análisis médico
3. **Recibir un análisis completo** que incluye:
   - Análisis general de los registros
   - Posibles diagnósticos
   - Tratamientos sugeridos
   - Señales de alerta
   - Recomendaciones
   - Observaciones clínicas

## Uso

1. Los doctores pueden seleccionar registros usando los checkboxes
2. Hacer clic en el botón "Análisis con IA"
3. Esperar el análisis (puede tomar unos momentos)
4. Revisar el análisis completo en el modal

## Seguridad

- Los datos se envían directamente a OpenAI
- Asegúrate de cumplir con las regulaciones de privacidad médica (HIPAA, etc.)
- Considera usar modelos fine-tuned o configuraciones de privacidad si manejas datos muy sensibles

## Costos

- El uso de OpenAI API tiene costos asociados
- `gpt-4o-mini` es más económico (~$0.15 por 1M tokens de entrada)
- Monitorea el uso en https://platform.openai.com/usage

## Notas Importantes

- Si no se configura `OPEN_API_KEY`, el análisis con IA no funcionará
- El sistema mostrará un error si se intenta usar sin la API key configurada
- Se recomienda implementar límites de uso para controlar costos
