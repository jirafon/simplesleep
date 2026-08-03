# Integracion Android: Boton De Pulsera (Foto, Apagado, Panico)

Esta guia define el contrato para integrar eventos del boton de pulsera con el backend de SiempreSalud.

## Objetivo

Permitir que la app Android:

- Registre cualquier evento de boton de pulsera.
- Dispare panico automaticamente para acciones SOS.
- Opcionalmente fuerce panico en acciones no SOS.
- Envie ubicacion cuando este disponible.

## Endpoints Backend

1. `POST /api/mobile/watch-button`

- Registra evento del boton (`watch_button_event`).
- Si la accion es de panico (`panic`, `panic_button`, `sos`, `long_press`) y la alerta esta habilitada, activa `panic_alert` automaticamente.
- Tambien puede forzarse con `triggerPanic=true`.

2. `POST /api/mobile/panic`

- Dispara panico directo, sin evaluar accion del boton.
- Registrar y notificar de inmediato.

## Mapeo Recomendado De Pulsaciones

Implementacion sugerida en Android (puedes ajustar segun firmware):

1. Pulsacion corta:

- Accion: `photo_trigger`
- Comportamiento: gatillar foto en telefono.
- Panico: `false`

2. Doble pulsacion:

- Accion: `power_off`
- Comportamiento: apagar pulsera o abrir confirmacion de apagado.
- Panico: `false` por defecto.

3. Pulsacion larga (>= 2 segundos):

- Accion: `sos`
- Comportamiento: activar panico.
- Panico: automatico por backend.

## Payload Base Para /watch-button

```json
{
  "email": "paciente@correo.cl",
  "action": "sos",
  "source": "watch_button",
  "deviceId": "WATCH-001",
  "dataType": 999,
  "rawData": "button_long_press",
  "triggerPanic": false,
  "latitude": -33.4489,
  "longitude": -70.6693
}
```

Campos:

- `email` (requerido): identifica usuario.
- `action` (requerido): accion detectada por app/pulsera.
- `source` (opcional): origen, por defecto `watch_button`.
- `deviceId` (opcional): identificador dispositivo.
- `dataType` (opcional): codigo de evento del SDK/firmware.
- `rawData` (opcional): payload crudo para auditoria.
- `triggerPanic` (opcional): forzar panico incluso si accion no es SOS.
- `latitude`, `longitude` (opcionales): ubicacion al momento del evento.

## Respuestas Esperadas

### Caso 1: Evento sin panico

```json
{
  "success": true,
  "action": "photo_trigger",
  "panicTriggered": false,
  "panicAlertEnabled": true,
  "message": "Evento de boton registrado sin activar alerta de panico."
}
```

### Caso 2: Evento que dispara panico

```json
{
  "success": true,
  "action": "sos",
  "panicTriggered": true,
  "panicAlertEnabled": true,
  "message": "Evento de boton registrado y alerta de panico activada.",
  "alert": {
    "type": "panic_alert",
    "source": "watch_button",
    "deviceId": "WATCH-001",
    "dataType": 999,
    "rawData": "button_long_press",
    "triggeredAt": "2026-07-01T12:34:56.000Z",
    "location": {
      "latitude": -33.4489,
      "longitude": -70.6693
    }
  },
  "emailNotification": {
    "sent": true,
    "skipped": false,
    "error": null
  }
}
```

## Recomendacion De Flujo Android

1. Captura evento del boton desde SDK BLE/Watch.
2. Traduce a accion semantica (`photo_trigger`, `power_off`, `sos`).
3. Ejecuta accion local de UX (por ejemplo abrir camara).
4. En paralelo, envia `POST /api/mobile/watch-button`.
5. Si no hay red, encola para reintento.
6. Si `panicTriggered=true`, mostrar confirmacion al usuario y mantener pantalla de emergencia.

## Cola Offline Y Reintentos

Sugerencia minima:

- Persistir eventos en SQLite/Room cuando falle envio.
- Reintentar con backoff: 5s, 15s, 30s, 60s, luego cada 5 min.
- Limite recomendado de cola: 200 eventos.
- Para eventos SOS, priorizar envio inmediato y reintentos mas agresivos.

## Idempotencia Y Duplicados

Para evitar duplicados por reintentos, agrega en Android:

- `clientEventId` (UUID por evento)
- `eventTimestamp` (ms)

Nota: hoy backend no deduplica por `clientEventId`; si se requiere, agregar una mejora posterior en servidor.

## Manejo De Errores

- `400`: faltan datos (ej. email) -> corregir payload.
- `404`: usuario no encontrado -> validar email/sesion.
- `500`: error servidor -> reintentar con backoff.

## Pruebas Rapidas (QA)

1. Pulsacion corta:

- Debe registrar `watch_button_event` con `action=photo_trigger`.
- No debe disparar panico.

2. Pulsacion larga:

- Debe registrar `watch_button_event` y `panic_alert`.
- Debe enviar email de panico si esta configurado.

3. Doble pulsacion con `triggerPanic=true`:

- Debe registrar evento y disparar panico, aunque accion no sea SOS.

4. Sin ubicacion:

- Debe funcionar igual, `location=null`.

## Auditoria En Admin

Los eventos se pueden revisar en:

- Vista: pagina Datos Biometricos (bloque auditoria boton/panico).
- API: `GET /api/admin/watch-events?limit=50`
- Filtro opcional: `type=watch_button_event` o `type=panic_alert`.

## Seguridad Operativa

- Nunca bloquees UX local por fallo de red.
- Para SOS, prioriza envio inmediato y confirma al usuario visual y vibracion larga.
- No loguear tokens en consola de produccion.
- Si incluyes ubicacion, declarar permisos y consentimiento en la app.

## GPS En Segundo Plano (Pantalla Apagada, Corriendo, Durmiendo)

Objetivo: que la app responda ubicacion incluso cuando no esta abierta en primer plano.

### Realidad tecnica (importante)

- Android e iOS limitan tareas en segundo plano para ahorrar bateria.
- Si el usuario fuerza cierre de la app, no existe garantia 100% de respuesta inmediata.
- En Android, la estrategia mas robusta es combinar:
  - Foreground service de ubicacion
  - Push de alta prioridad para despertar flujo
  - Fallback con ultima ubicacion conocida

### Fase 1 (rapida, bajo riesgo)

1. Mantener endpoint actual de solicitud en vivo:
  - `POST /api/mobile/location-requests`
  - `GET /api/mobile/location-requests/pending`
  - `POST /api/mobile/location-requests/:requestId/response`
  - `GET /api/mobile/location-requests/:requestId/status`
2. En Android, agregar polling en background cada 20-60 segundos solo cuando:
  - usuario autenticado
  - permisos activos
  - bateria no critica
3. Cuando exista solicitud pendiente:
  - leer GPS actual con timeout corto
  - enviar respuesta al backend
4. Si no hay fix GPS en tiempo limite:
  - responder con `error` explicando causa
  - incluir ultima ubicacion conocida si existe
5. Agregar cola offline para reintentos:
  - backoff: 5s, 15s, 30s, 60s, luego cada 5 minutos

Impacto esperado: mejora inmediata, pero con huecos en dispositivos con optimizacion agresiva de bateria.

### Fase 2 (robusta, recomendada produccion)

1. Android Foreground Service permanente para ubicacion:
  - notificacion visible obligatoria
  - captura periodica y/o por eventos de movimiento
2. Integrar push de alta prioridad (FCM data message):
  - backend crea solicitud en vivo
  - backend envia push al dispositivo objetivo
  - app despierta, obtiene GPS y responde solicitud
3. Guardar token push por dispositivo y usuario:
  - endpoint para registrar/actualizar token
  - invalidar token en logout o error de entrega permanente
4. Robustecer bateria y reinicios:
  - iniciar servicio al boot
  - solicitar exclusiones de optimizacion para usuarios criticos
5. Politica de degradacion:
  - si no se logra GPS actual: enviar ultima ubicacion conocida + edad del dato

Impacto esperado: comportamiento estable con pantalla apagada y mejor respuesta en actividad fisica/sueno.

### Permisos minimos Android

- Ubicacion precisa
- Ubicacion en segundo plano
- Foreground service de ubicacion
- Ignorar optimizacion de bateria (opcional, recomendado para casos criticos)

### Contrato recomendado de respuesta GPS (app -> backend)

Extender payload actual incluyendo:

- `accuracy` (metros)
- `capturedAt` (ISO)
- `isFromLastKnown` (boolean)
- `ageMs` (antiguedad del fix)
- `provider` (`gps`, `network`, `fused`)

Esto permite al admin distinguir ubicacion fresca vs fallback.

### Recomendacion de polling admin

- Crear solicitud en vivo.
- Consultar estado cada 2-3 segundos por maximo 60 segundos.
- Finalizar con estados:
  - `completed`: ubicacion recibida
  - `failed`: app respondio sin coordenadas validas
  - `expired`: no hubo respuesta a tiempo

### Observabilidad minima

Registrar metricas:

- tiempo desde solicitud hasta respuesta
- porcentaje `completed/failed/expired`
- precision promedio (`accuracy`)
- porcentaje de respuestas con `isFromLastKnown=true`

Con estas metricas podras validar si la app realmente responde mejor en segundo plano.
