// Google Calendar API Configuration
// Este archivo contiene la configuración para la integración con Google Calendar

export const GOOGLE_CALENDAR_CONFIG = {
  // Credenciales de la API de Google
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
  API_KEY: process.env.REACT_APP_GOOGLE_API_KEY || 'your-google-api-key',
  
  // Configuración del calendario
  CALENDAR_ID: 'primary', // Usar el calendario principal del usuario
  
  // Configuración de eventos
  EVENT_CONFIG: {
    // Configuración de recordatorios por defecto
    REMINDERS: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 horas antes por email
        { method: 'popup', minutes: 30 }        // 30 minutos antes por popup
      ]
    },
    
    // Configuración de conferencia (Google Meet)
    CONFERENCE_DATA: {
      createRequest: {
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    }
  },
  
  // Configuración de horarios de trabajo
  BUSINESS_HOURS: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: { start: '10:00', end: '14:00' },
    sunday: null // Cerrado
  },
  
  // Zona horaria
  TIMEZONE: 'America/Santiago',
  
  // Configuración de slots de tiempo
  TIME_SLOTS: {
    DURATION: 30, // 30 minutos por slot
    INTERVALS: ['00', '30'] // Minutos de inicio de cada slot
  },
  
  // Tipos de reunión por startup
  MEETING_TYPES: {
    'Smartrisk': [
      'Demo técnica',
      'Consultoría de riesgos',
      'Implementación',
      'Capacitación'
    ],
    'DataGuard': [
      'Auditoría de datos',
      'Configuración GDPR',
      'Soporte técnico',
      'Consultoría'
    ],
    'ComplianceFlow': [
      'Demo del sistema',
      'Configuración inicial',
      'Capacitación',
      'Soporte'
    ],
    'RiskMatrix': [
      'Demo de matrices',
      'Configuración',
      'Consultoría',
      'Implementación'
    ],
    'AuditPro': [
      'Demo del sistema',
      'Configuración',
      'Capacitación',
      'Soporte'
    ],
    'PolicyManager': [
      'Demo de políticas',
      'Configuración',
      'Consultoría',
      'Implementación'
    ],
    'IncidentTracker': [
      'Demo del sistema',
      'Configuración',
      'Capacitación',
      'Soporte'
    ],
    'ReportGenius': [
      'Demo de reportes',
      'Configuración',
      'Consultoría',
      'Capacitación'
    ]
  },
  
  // Duración de reuniones disponibles
  MEETING_DURATIONS: [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' }
  ],
  
  // Email de contacto para eventos
  CONTACT_EMAIL: 'contacto@unbiax.com',
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    // Email de confirmación
    CONFIRMATION_EMAIL: {
      subject: 'Confirmación de Reunión - Unbiax',
      template: (eventData) => `
        <h2>¡Tu reunión ha sido confirmada!</h2>
        <p><strong>Fecha:</strong> ${eventData.date}</p>
        <p><strong>Hora:</strong> ${eventData.time}</p>
        <p><strong>Startup:</strong> ${eventData.startup}</p>
        <p><strong>Tipo de reunión:</strong> ${eventData.meetingType}</p>
        <p><strong>Enlace de Google Meet:</strong> <a href="${eventData.meetLink}">${eventData.meetLink}</a></p>
        <p>Te esperamos en la reunión.</p>
      `
    }
  }
};

// Función para validar configuración
export const validateConfig = () => {
  const requiredFields = ['CLIENT_ID', 'API_KEY'];
  const missingFields = requiredFields.filter(field => !GOOGLE_CALENDAR_CONFIG[field] || GOOGLE_CALENDAR_CONFIG[field] === 'your-google-client-id');
  
  if (missingFields.length > 0) {
    console.warn('Google Calendar configuration missing:', missingFields);
    return false;
  }
  
  return true;
};

export default GOOGLE_CALENDAR_CONFIG; 