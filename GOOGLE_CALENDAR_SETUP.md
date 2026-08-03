# 🗓️ Configuración de Google Calendar API

Este documento explica cómo configurar la integración con Google Calendar para el sistema de agendamiento de reuniones.

## 📋 Prerrequisitos

1. **Cuenta de Google** con acceso a Google Cloud Console
2. **Proyecto en Google Cloud Console**
3. **Google Calendar API habilitada**

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** para usarlo más adelante

### 2. Habilitar Google Calendar API

1. En la consola de Google Cloud, ve a **APIs & Services** > **Library**
2. Busca "Google Calendar API"
3. Haz clic en "Enable"

### 3. Configurar Credenciales

#### Opción A: OAuth 2.0 Client ID (Recomendado para producción)

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: `Unbiax Calendar Integration`
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)

5. Copia el **Client ID** generado

#### Opción B: API Key (Solo para desarrollo)

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **"Create Credentials"** > **"API Key"**
3. Copia la **API Key** generada

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Google Calendar API Configuration
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id-aqui
REACT_APP_GOOGLE_API_KEY=tu-api-key-aqui

# Configuración adicional
REACT_APP_CALENDAR_TIMEZONE=America/Santiago
REACT_APP_CONTACT_EMAIL=ncastillo@unbiax.com
```

### 5. Configurar Permisos de Calendario

#### Para OAuth 2.0:

1. En **APIs & Services** > **OAuth consent screen**
2. Configura la pantalla de consentimiento:
   - **App name**: `Unbiax Calendar`
   - **User support email**: `ncastillo@unbiax.com`
   - **Developer contact information**: `ncastillo@unbiax.com`
   - **Scopes**: Agrega `https://www.googleapis.com/auth/calendar.events`

#### Para API Key:

1. En **APIs & Services** > **Credentials**
2. Edita tu API Key
3. En **API restrictions**, selecciona **"Restrict key"**
4. Selecciona **"Google Calendar API"**

### 6. Configurar Calendario de Unbiax

1. Ve a [Google Calendar](https://calendar.google.com/)
2. Crea un nuevo calendario llamado "Unbiax Reuniones"
3. Comparte el calendario con `ncastillo@unbiax.com` con permisos de **"Make changes to events"**
4. Copia el **Calendar ID** (se encuentra en la configuración del calendario)

### 7. Actualizar Configuración

En `src/config/googleCalendar.js`, actualiza:

```javascript
export const GOOGLE_CALENDAR_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  CALENDAR_ID: 'ncastillo@unbiax.com', // O el ID del calendario compartido
  // ... resto de la configuración
};
```

## 🔧 Configuración del Backend

### Endpoint para Crear Eventos

El backend debe tener un endpoint para crear eventos en Google Calendar:

```javascript
// POST /calendar/create-event
{
  "summary": "Reunión Smartrisk - Demo técnica",
  "description": "Detalles de la reunión...",
  "start": {
    "dateTime": "2024-01-15T10:00:00-03:00",
    "timeZone": "America/Santiago"
  },
  "end": {
    "dateTime": "2024-01-15T11:00:00-03:00",
    "timeZone": "America/Santiago"
  },
  "attendees": [
    { "email": "cliente@empresa.com" },
    { "email": "ncastillo@unbiax.com" }
  ],
  "reminders": {
    "useDefault": false,
    "overrides": [
      { "method": "email", "minutes": 24 * 60 },
      { "method": "popup", "minutes": 30 }
    ]
  }
}
```

### Servicio de Backend (Node.js/Express)

```javascript
const { google } = require('googleapis');

const calendar = google.calendar({ version: 'v3' });

app.post('/calendar/create-event', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    const event = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      resource: req.body,
      conferenceDataVersion: 1,
    });

    res.json(event.data);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});
```

## 🧪 Pruebas

### 1. Prueba Local

1. Ejecuta `npm start`
2. Abre el modal de agendamiento
3. Selecciona una fecha y hora
4. Verifica que se cree el evento en Google Calendar

### 2. Prueba de Integración

1. Verifica que los eventos se creen con Google Meet
2. Confirma que se envíen los emails de recordatorio
3. Prueba diferentes tipos de reunión y duraciones

## 🔒 Seguridad

### Variables de Entorno

- **Nunca** commits las credenciales en el código
- Usa `.env.local` para desarrollo local
- Configura las variables en el servidor de producción

### Permisos Mínimos

- Solo solicita permisos necesarios (`calendar.events`)
- No solicites acceso a otros calendarios
- Usa un calendario específico para Unbiax

### Rate Limiting

- Implementa rate limiting en el backend
- Maneja errores de cuota de API
- Monitorea el uso de la API

## 🚨 Troubleshooting

### Error: "Google API not loaded"

- Verifica que las credenciales estén configuradas
- Confirma que la API esté habilitada
- Revisa la consola del navegador para errores

### Error: "Calendar access denied"

- Verifica los permisos del calendario
- Confirma que el usuario esté autenticado
- Revisa la configuración de OAuth

### Error: "Invalid timezone"

- Verifica que la zona horaria esté configurada correctamente
- Usa formatos de zona horaria válidos (ej: `America/Santiago`)

## 📞 Soporte

Para problemas técnicos, contacta a:
- **Email**: ncastillo@unbiax.com
- **Documentación**: [Google Calendar API Docs](https://developers.google.com/calendar/api)

## 📝 Notas Adicionales

- Los eventos se crean con Google Meet automáticamente
- Se envían recordatorios por email y popup
- El sistema respeta los horarios de trabajo configurados
- Se pueden personalizar los tipos de reunión por startup 