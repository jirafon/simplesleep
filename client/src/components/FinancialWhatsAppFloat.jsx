import React, { useMemo, useState } from 'react';

/**
 * Botón flotante de WhatsApp (CRO):
 * - Permite contacto inmediato sin fricción.
 * - Mensaje prellenado orientado a "asesoría" (no venta agresiva).
 *
 * Configuración (opcional) vía variables de entorno CRA:
 * - REACT_APP_WHATSAPP_PHONE: ej "+56911112222" (recomendado con prefijo país).
 * - REACT_APP_WHATSAPP_MESSAGE: mensaje inicial.
 */
const FinancialWhatsAppFloat = () => {
  const [showHint, setShowHint] = useState(false);

  const phone = useMemo(() => {
    const raw = process.env.REACT_APP_WHATSAPP_PHONE || '+56987375517';
    // wa.me requiere solo dígitos (sin +, espacios, guiones).
    return raw.replace(/[^\d]/g, '');
  }, []);

  const message = useMemo(() => {
    return (
      process.env.REACT_APP_WHATSAPP_MESSAGE ||
      'Hola, quiero cotizar una Isapre o revisar mi APV. ¿Me puedes ayudar?'
    );
  }, []);

  const handleClick = () => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {showHint && (
        <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-xl max-w-xs border border-slate-200 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 mb-1">¿Prefieres WhatsApp?</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Escríbeme y te respondo con claridad, sin presiones.
              </p>
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowHint(true)}
          onFocus={() => setShowHint(true)}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ring-1 ring-white/10"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </button>

        {/* Micro-señal de disponibilidad (sin prometer tiempos específicos) */}
        <div className="absolute -top-2 left-full ml-2 bg-slate-950/90 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow border border-white/10 backdrop-blur">
          Respuesta rápida
        </div>
      </div>
    </div>
  );
};

export default FinancialWhatsAppFloat;

