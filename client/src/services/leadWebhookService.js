/**
 * Envío de leads a un webhook (Make/Zapier/n8n/Backend propio).
 *
 * Requerimiento: "enviar a la URL dada por el usuario para cada contacto".
 * - El formulario DEBE enviar a un webhook para considerarse enviado.
 * - Si falta URL, se considera error (evita pérdida silenciosa de leads).
 *
 * Configuración (CRA):
 * - REACT_APP_LEAD_WEBHOOK_URL: URL destino del webhook
 */

// Ejemplo de path (NO se usa como fallback).
// Importante: si no configuras variables de entorno, el formulario debe FALLAR (para no perder leads silenciosamente).
const EXAMPLE_WEBHOOK_PATH = '/webhook/workflows/6963becbb2b1837991fbdf3e/Lead_Inbound_Webhook';

/**
 * Origen del webhook cuando la URL se define como path relativo.
 * - Si REACT_APP_LEAD_WEBHOOK_ORIGIN está seteado, lo usamos.
 * - Si no, no hacemos fallback al origin del sitio (evita 404 en el mismo hosting de la landing).
 *
 * Ej:
 * REACT_APP_LEAD_WEBHOOK_ORIGIN=https://tu-workflow-host.com
 * REACT_APP_LEAD_WEBHOOK_URL=/webhook/...
 */
function getWebhookOrigin() {
  const raw = (process.env.REACT_APP_LEAD_WEBHOOK_ORIGIN || '').trim();
  return raw;
}

function getWebhookUrl() {
  const raw = (process.env.REACT_APP_LEAD_WEBHOOK_URL || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) {
    const origin = getWebhookOrigin();
    if (!origin) return '';
    return `${origin}${raw}`;
  }
  return raw;
}

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, cancel: () => clearTimeout(id) };
}

function readUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
  ];
  const utm = {};
  keys.forEach((k) => {
    const v = params.get(k);
    if (v) utm[k] = v;
  });
  return utm;
}

export function buildLeadPayload(form) {
  const interestLabel =
    form.interest === 'isapre'
      ? 'Isapre'
      : form.interest === 'apv'
        ? 'APV'
        : form.interest === 'seguros'
          ? 'Seguros'
          : 'Revisión';

  const insuranceType = form.insuranceType || form.insurance_type || '';
  const notes = form.notes || form.message || form.mensaje || '';

  const insuranceBlock =
    form.interest === 'seguros' && insuranceType
      ? ` Tipo de seguro: ${insuranceType}.`
      : '';
  const notesBlock = notes ? ` Mensaje: ${String(notes).trim()}` : '';

  // “message/mensaje” requerido por el webhook: generamos uno claro (sin promesas).
  const messageText = `Solicitud desde landing. Interés: ${interestLabel}.${insuranceBlock} Email: ${form.email}.${notesBlock}`.trim();

  return {
    // Datos del lead
    name: form.name,
    nombre: form.name,
    phone: form.phone,
    telefono: form.phone,
    email: form.email,
    interest: form.interest,
    insurance_type: insuranceType || undefined,
    insuranceType: insuranceType || undefined,
    notes: notes || undefined,
    message: messageText,
    mensaje: messageText,

    // Metadata (mejora calificación sin fricción)
    source: 'landing',
    fuente: 'landing',
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    utm: readUtmParams(),
    user_agent: navigator.userAgent,
    ts: new Date().toISOString(),
  };
}

export async function sendLeadToWebhook(payload) {
  const url = getWebhookUrl();
  if (!url) {
    throw new Error(
      'Missing lead webhook config: set REACT_APP_LEAD_WEBHOOK_URL (absolute) or set REACT_APP_LEAD_WEBHOOK_ORIGIN + REACT_APP_LEAD_WEBHOOK_URL (relative, e.g. ' +
        EXAMPLE_WEBHOOK_PATH +
        ').',
    );
  }

  const { controller, cancel } = withTimeout(12_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Intentamos capturar algo de contexto si el webhook devuelve texto
      const text = await res.text().catch(() => '');
      const msg = text ? `Webhook status ${res.status}: ${text}` : `Webhook status ${res.status}`;
      const err = new Error(msg);
      // @ts-ignore - adjuntamos metadata útil para debug
      err.status = res.status;
      // @ts-ignore
      err.url = url;
      throw err;
    }
  } finally {
    cancel();
  }
}

