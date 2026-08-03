/**
 * Servicio para generar links de telemedicina
 * 
 * Actualmente usa Jitsi Meet (gratuito y open source)
 * Puede extenderse para soportar Zoom, Google Meet, etc.
 */

/**
 * Genera un link único de Jitsi Meet para una cita
 * @param {String} appointmentId - ID único del appointment
 * @param {String} userId - ID del usuario
 * @param {Date} appointmentDate - Fecha de la cita
 * @returns {String} URL de la sala de Jitsi Meet
 */
function generateJitsiMeetLink(appointmentId, userId, appointmentDate) {
  // Crear un nombre de sala único y seguro
  // Formato: Siempresalud-{appointmentId}-{timestamp}
  const roomName = `Siempresalud-${appointmentId.toString().slice(-8)}-${Date.now().toString().slice(-6)}`;
  
  // Jitsi Meet permite usar cualquier string como nombre de sala
  // El link será: https://meet.jit.si/{roomName}
  const baseUrl = process.env.JITSI_MEET_BASE_URL || 'https://meet.jit.si';
  const meetingLink = `${baseUrl}/${roomName}`;
  
  return meetingLink;
}

/**
 * Genera un link de telemedicina para una cita
 * @param {Object} appointmentData - Datos del appointment
 * @returns {String} URL de la sala de telemedicina
 */
function generateMeetingLink(appointmentData) {
  const { _id, userId, appointmentDate } = appointmentData;
  
  // Por ahora usamos Jitsi Meet
  // En el futuro se puede agregar lógica para elegir entre diferentes plataformas
  const platform = process.env.TELEMEDICINE_PLATFORM || 'jitsi';
  
  switch (platform.toLowerCase()) {
    case 'jitsi':
    default:
      return generateJitsiMeetLink(_id, userId, appointmentDate);
    
    // Futuras integraciones:
    // case 'zoom':
    //   return generateZoomLink(appointmentData);
    // case 'google-meet':
    //   return generateGoogleMeetLink(appointmentData);
    // case 'microsoft-teams':
    //   return generateTeamsLink(appointmentData);
  }
}

/**
 * Genera información adicional para la reunión
 * @param {Object} appointmentData - Datos del appointment
 * @returns {Object} Información de la reunión
 */
function generateMeetingInfo(appointmentData) {
  const meetingLink = generateMeetingLink(appointmentData);
  
  return {
    meetingLink,
    platform: process.env.TELEMEDICINE_PLATFORM || 'jitsi',
    meetingId: meetingLink.split('/').pop(), // Extraer el ID de la sala
    instructions: getMeetingInstructions(process.env.TELEMEDICINE_PLATFORM || 'jitsi')
  };
}

/**
 * Obtiene instrucciones para unirse a la reunión según la plataforma
 * @param {String} platform - Plataforma de telemedicina
 * @returns {String} Instrucciones para el usuario
 */
function getMeetingInstructions(platform) {
  const instructions = {
    jitsi: 'Haz clic en el enlace para unirte a la videollamada. No necesitas instalar nada, funciona directamente en tu navegador.',
    zoom: 'Haz clic en el enlace para unirte a la videollamada. Si es la primera vez, se descargará la aplicación Zoom.',
    'google-meet': 'Haz clic en el enlace para unirte a la videollamada de Google Meet. Funciona en navegador o app móvil.',
    'microsoft-teams': 'Haz clic en el enlace para unirte a la videollamada de Teams. Puedes usar el navegador o la aplicación.'
  };
  
  return instructions[platform.toLowerCase()] || instructions.jitsi;
}

module.exports = {
  generateMeetingLink,
  generateMeetingInfo,
  getMeetingInstructions
};
