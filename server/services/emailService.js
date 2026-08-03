const formData = require('form-data');
const Mailgun = require('mailgun.js');
const axios = require('axios');

function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY || process.env.MG_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN || process.env.MG_DOMAIN;
  if (!apiKey || !domain) return null;

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({
    username: 'api',
    key: apiKey,
  });
  return { client, domain };
}

function isConfigured() {
  const apiKey = process.env.MAILGUN_API_KEY || process.env.MG_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN || process.env.MG_DOMAIN;
  return !!(apiKey && domain);
}

function isWhatsAppConfigured() {
  const accountSid = process.env.ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  return Boolean(accountSid && authToken && from);
}

function normalizeWhatsappNumber(value) {
  const digits = String(value || '').trim().replace(/[^0-9+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('whatsapp:')) return digits;
  const normalized = digits.startsWith('+') ? digits : `+${digits}`;
  return `whatsapp:${normalized}`;
}

function buildBitacoraUrl(urlCandidate) {
  if (!urlCandidate) {
    return '';
  }

  const trimmed = String(urlCandidate).trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    const normalizedPath = parsed.pathname
      .replace(/\/+$/, '')
      .replace(/(?:\/bitacora)+$/i, '');
    parsed.pathname = `${normalizedPath || ''}/bitacora`;
    return parsed.toString();
  } catch (_error) {
    const normalized = trimmed
      .replace(/\/+$/, '')
      .replace(/(?:\/bitacora)+$/i, '');
    return `${normalized}/bitacora`;
  }
}

function getManualApprovalRecipients() {
  const configuredRecipients = String(process.env.ORDER_MANUAL_APPROVAL_NOTIFY_TO || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (configuredRecipients.length > 0) {
    return configuredRecipients;
  }

  return ['chaquin@gmail.com', 'romerino@gmail.com'];
}

async function sendPasswordResetEmail(to, code) {
  const mg = getMailgunClient();
  if (!mg) {
    throw new Error('Mailgun no está configurado. Falta MAILGUN_API_KEY o MAILGUN_DOMAIN');
  }

  const from = process.env.MAILGUN_FROM || `Siempresalud <noreply@${mg.domain}>`;
  const subject = 'Recuperación de contraseña - Siempresalud';
  const text = `Hola,\n\nHemos recibido una solicitud para restablecer tu contraseña.\n\nTu código de verificación es: ${code}\n\nEste código expira en 15 minutos.\n\nSi no solicitaste este cambio, puedes ignorar este correo.`;
  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
    <h2>Recuperación de contraseña</h2>
    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
    <p>Tu código de verificación es:</p>
    <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 12px 16px; display: inline-block; border-radius: 8px;">${code}</div>
    <p style="margin-top: 12px;">Este código expira en <strong>15 minutos</strong>.</p>
    <p style="color:#6b7280; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
  </div>`;

  try {
    const result = await mg.client.messages.create(mg.domain, {
      from,
      to: [to],
      subject,
      text,
      html
    });
    return { success: true, id: result.id, message: result.message };
  } catch (err) {
    throw new Error(`Fallo al enviar email con Mailgun: ${err.message}`);
  }
}

async function sendOrderCompletedEmail({
  to,
  customerName,
  orderId,
  exams = [],
  bitacoraUrl,
  downloadUrl
}) {
  const mg = getMailgunClient();
  if (!mg) {
    throw new Error('Mailgun no está configurado. Falta MAILGUN_API_KEY o MAILGUN_DOMAIN');
  }

  const from = process.env.MAILGUN_FROM || `Siempresalud <noreply@${mg.domain}>`;
  const examList = Array.isArray(exams) ? exams.filter(Boolean) : [];
  const examText = examList.length > 0 ? examList.join(', ') : 'Exámenes médicos solicitados';
  const safeName = customerName || 'Paciente';
  const safeBitacoraUrl = buildBitacoraUrl(
    bitacoraUrl || process.env.FRONTEND_URL || process.env.CLIENT_URL
  );

  const subject = `Tu orden médica está lista - #${String(orderId || '').slice(-8).toUpperCase()}`;

  const text = [
    `Hola ${safeName},`,
    '',
    'Tu orden médica fue completada exitosamente en Siempresalud.',
    `Orden: #${String(orderId || '').slice(-8).toUpperCase()}`,
    `Exámenes: ${examText}`,
    safeBitacoraUrl ? `Bitácora: ${safeBitacoraUrl}` : null,
    downloadUrl ? `Descarga directa: ${downloadUrl}` : null,
    '',
    'Gracias por preferir Siempresalud.'
  ].filter(Boolean).join('\n');

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
    <h2>Tu orden médica está lista</h2>
    <p>Hola <strong>${safeName}</strong>,</p>
    <p>Tu orden médica fue completada exitosamente en Siempresalud.</p>
    <p><strong>Orden:</strong> #${String(orderId || '').slice(-8).toUpperCase()}</p>
    <p><strong>Exámenes:</strong> ${examText}</p>
    ${safeBitacoraUrl ? `<p><a href="${safeBitacoraUrl}" style="display:inline-block;padding:10px 14px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;">Ver en mi Bitácora</a></p>` : ''}
    ${downloadUrl ? `<p><a href="${downloadUrl}" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Descargar orden</a></p>` : ''}
    <p style="color:#6b7280; font-size: 12px;">Si no reconoces esta actividad, contáctanos.</p>
  </div>`;

  try {
    const result = await mg.client.messages.create(mg.domain, {
      from,
      to: [to],
      subject,
      text,
      html
    });
    return { success: true, id: result.id, message: result.message };
  } catch (err) {
    throw new Error(`Fallo al enviar email de orden completada: ${err.message}`);
  }
}

async function sendManualApprovalOrderNotification({
  orderId,
  customerName,
  customerEmail,
  exams = [],
  totalAmount,
}) {
  const mg = getMailgunClient();
  if (!mg) {
    throw new Error('Mailgun no está configurado. Falta MAILGUN_API_KEY o MAILGUN_DOMAIN');
  }

  const recipients = getManualApprovalRecipients();
  const from = process.env.MAILGUN_FROM || `Siempresalud <noreply@${mg.domain}>`;
  const examList = Array.isArray(exams) ? exams.filter(Boolean) : [];
  const examText = examList.length > 0 ? examList.join(', ') : 'No informado';
  const safeName = customerName || 'Paciente';
  const orderLabel = `#${String(orderId || '').slice(-8).toUpperCase()}`;
  const formattedTotal = Number.isFinite(Number(totalAmount))
    ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(totalAmount))
    : 'No informado';

  const subject = `Nueva orden en aprobacion manual - ${orderLabel}`;
  const text = [
    'Se registro una nueva orden medica en modo de aprobacion manual.',
    `Orden: ${orderLabel}`,
    `Paciente: ${safeName}`,
    `Email paciente: ${customerEmail || 'No informado'}`,
    `Examenes: ${examText}`,
    `Monto: ${formattedTotal}`,
  ].join('\n');

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
    <h2>Nueva orden en aprobacion manual</h2>
    <p>Se registro una nueva orden medica que requiere revision.</p>
    <p><strong>Orden:</strong> ${orderLabel}</p>
    <p><strong>Paciente:</strong> ${safeName}</p>
    <p><strong>Email paciente:</strong> ${customerEmail || 'No informado'}</p>
    <p><strong>Examenes:</strong> ${examText}</p>
    <p><strong>Monto:</strong> ${formattedTotal}</p>
  </div>`;

  try {
    const result = await mg.client.messages.create(mg.domain, {
      from,
      to: recipients,
      subject,
      text,
      html,
    });

    return { success: true, id: result.id, message: result.message, recipients };
  } catch (err) {
    throw new Error(`Fallo al enviar email de notificacion de aprobacion manual: ${err.message}`);
  }
}

async function sendPanicAlertEmail({
  to,
  userName,
  source,
  deviceId,
  dataType,
  rawData,
  triggeredAt,
  latitude,
  longitude
}) {
  const mg = getMailgunClient();
  if (!mg) {
    throw new Error('Mailgun no esta configurado. Falta MAILGUN_API_KEY o MAILGUN_DOMAIN');
  }

  const from = process.env.MAILGUN_FROM || `Siempresalud <noreply@${mg.domain}>`;
  const recipients = (Array.isArray(to) ? to : [to])
    .map((email) => String(email || '').trim().toLowerCase())
    .filter(Boolean);
  if (recipients.length === 0) {
    throw new Error('No hay destinatarios configurados para Assistance Request');
  }
  const safeName = String(userName || 'Usuario').trim() || 'Usuario';
  const safeSource = String(source || 'help_button').trim() || 'help_button';
  const safeDeviceId = String(deviceId || 'No informado').trim() || 'No informado';
  const safeDataType = Number.isFinite(Number(dataType)) ? Number(dataType) : 'No informado';
  const safeRawData = String(rawData || '').trim() || 'No informado';
  const safeTriggeredAt = String(triggeredAt || new Date().toISOString()).trim();
  const safeLatitude = Number.isFinite(Number(latitude)) ? Number(latitude) : null;
  const safeLongitude = Number.isFinite(Number(longitude)) ? Number(longitude) : null;
  const hasLocation = Number.isFinite(safeLatitude) && Number.isFinite(safeLongitude);
  const mapUrl = hasLocation
    ? `https://www.google.com/maps?q=${safeLatitude},${safeLongitude}`
    : null;

  const subject = 'Assistance Request / Family Assistance - SiempreSleep';
  const text = [
    `Hola,`,
    '',
    `${safeName} activó Request Help (Family Assistance) en SiempreSleep.`,
    'Esto NO es una emergencia médica ni un contacto con 911.',
    `Fecha: ${safeTriggeredAt}`,
    `Origen: ${safeSource}`,
    `Dispositivo: ${safeDeviceId}`,
    `DataType reloj: ${safeDataType}`,
    `RawData: ${safeRawData}`,
    hasLocation ? `Ubicacion: ${safeLatitude}, ${safeLongitude}` : 'Ubicacion: No reportada',
    hasLocation ? `Mapa: ${mapUrl}` : null,
    '',
    'Si no reconoces esta accion, revisa el dispositivo y contacta a la persona.'
  ].filter(Boolean).join('\n');

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
    <h2>Assistance Request / Family Assistance</h2>
    <p><strong>${safeName}</strong> solicitó ayuda familiar en SiempreSleep.</p>
    <p style="color:#b45309"><strong>No es una emergencia médica ni un llamado al 911.</strong></p>
    <p><strong>Fecha:</strong> ${safeTriggeredAt}</p>
    <p><strong>Origen:</strong> ${safeSource}</p>
    <p><strong>Dispositivo:</strong> ${safeDeviceId}</p>
    <p><strong>DataType reloj:</strong> ${safeDataType}</p>
    <p><strong>RawData:</strong> ${safeRawData}</p>
    <p><strong>Ubicacion:</strong> ${hasLocation ? `${safeLatitude}, ${safeLongitude}` : 'No reportada'}</p>
    ${hasLocation ? `<p><a href="${mapUrl}" target="_blank" rel="noopener noreferrer">Ver ubicacion en mapa</a></p>` : ''}
    <p style="color:#6b7280; font-size: 12px;">Si no reconoces esta accion, revisa el dispositivo y contacta a la persona.</p>
  </div>`;

  try {
    const result = await mg.client.messages.create(mg.domain, {
      from,
      to: recipients,
      subject,
      text,
      html
    });
    return { success: true, id: result.id, message: result.message, recipients };
  } catch (err) {
    throw new Error(`Fallo al enviar email de panico: ${err.message}`);
  }
}

async function sendPanicAlertWhatsApp({
  to,
  userName,
  source,
  deviceId,
  dataType,
  rawData,
  triggeredAt,
  latitude,
  longitude
}) {
  const accountSid = process.env.ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
  const from = normalizeWhatsappNumber(
    process.env.WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
  );

  if (!accountSid || !authToken) {
    throw new Error('Twilio WhatsApp no está configurado. Falta ACCOUNT_SID o AUTH_TOKEN');
  }

  const toNumber = normalizeWhatsappNumber(to);
  if (!toNumber) {
    throw new Error('No hay número WhatsApp configurado para alerta de pánico');
  }

  const safeName = String(userName || 'Paciente').trim() || 'Paciente';
  const safeSource = String(source || 'watch_button').trim() || 'watch_button';
  const safeDeviceId = String(deviceId || 'No informado').trim() || 'No informado';
  const safeDataType = Number.isFinite(Number(dataType)) ? Number(dataType) : 'No informado';
  const safeRawData = String(rawData || '').trim() || 'No informado';
  const safeTriggeredAt = String(triggeredAt || new Date().toISOString()).trim();
  const safeLatitude = Number.isFinite(Number(latitude)) ? Number(latitude) : null;
  const safeLongitude = Number.isFinite(Number(longitude)) ? Number(longitude) : null;
  const hasLocation = Number.isFinite(safeLatitude) && Number.isFinite(safeLongitude);
  const mapUrl = hasLocation
    ? `https://www.google.com/maps?q=${safeLatitude},${safeLongitude}`
    : null;

  const body = [
    'ALERTA DE PANICO - SiempreSalud',
    `Paciente: ${safeName}`,
    `Fecha: ${safeTriggeredAt}`,
    `Origen: ${safeSource}`,
    `Dispositivo: ${safeDeviceId}`,
    `DataType: ${safeDataType}`,
    `RawData: ${safeRawData}`,
    hasLocation ? `Ubicacion: ${safeLatitude}, ${safeLongitude}` : 'Ubicacion: No reportada',
    hasLocation ? `Mapa: ${mapUrl}` : null
  ].filter(Boolean).join('\n');

  const payload = new URLSearchParams({
    From: from,
    To: toNumber,
    Body: body
  });

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      payload.toString(),
      {
        auth: { username: accountSid, password: authToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return {
      success: true,
      sid: response.data?.sid,
      status: response.data?.status,
      to: response.data?.to,
      from: response.data?.from
    };
  } catch (err) {
    const details = err?.response?.data?.message || err.message;
    throw new Error(`Fallo al enviar WhatsApp de panico: ${details}`);
  }
}

module.exports = {
  isConfigured,
  isWhatsAppConfigured,
  sendPasswordResetEmail,
  sendOrderCompletedEmail,
  sendManualApprovalOrderNotification,
  sendPanicAlertEmail,
  sendPanicAlertWhatsApp,
};
