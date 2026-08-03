export function normalizeRut(rut) {
  return String(rut || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
}

export function formatRut(rut) {
  const normalized = normalizeRut(rut);

  if (!normalized) {
    return '';
  }

  if (normalized.length === 1) {
    return normalized;
  }

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${bodyWithDots}-${dv}`;
}

function computeRutDv(bodyDigits) {
  let sum = 0;
  let multiplier = 2;

  for (let i = bodyDigits.length - 1; i >= 0; i -= 1) {
    sum += Number(bodyDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export function isValidChileanRut(rut) {
  const normalized = normalizeRut(rut);

  if (!/^\d{7,8}[0-9K]$/.test(normalized)) {
    return false;
  }

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);

  return computeRutDv(body) === dv;
}
