import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackToTop from '../components/BackToTop';
import FinancialWhatsAppFloat from '../components/FinancialWhatsAppFloat';
import { buildLeadPayload, sendLeadToWebhook } from '../services/leadWebhookService';
import heroImage from '../assets/im1.png';
const siempreSaludLogo = '/siempresaludp.png';

/**
 * Landing principal (CRO + UX para servicios regulados en Chile)
 *
 * OBJETIVO: captación de leads calificados para:
 * - Cotización / cambio de Isapre
 * - Asesoría APV (beneficio tributario)
 *
 * NOTA: lenguaje simple, enfoque asesor (no vendedor), sin promesas irreales.
 */
function MainLanding() {
  // --- Configurable placeholders (reemplazar para producción) ---
  const advisorName = 'Asesor financiero independiente'; // TODO: reemplazar con nombre real
  const experienceYears = 'X'; // TODO: reemplazar con años reales
  const contactEmail = 'contacto@unbiax.com';

  // --- Form state ---
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'isapre',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' }); // idle | loading | success | error

  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openWhatsApp = () => {
    // Delegamos al botón flotante para mantener el CTA secundario coherente.
    // Igual dejamos CTA funcional aquí (mensaje más específico).
    const rawPhone = (process.env.REACT_APP_WHATSAPP_PHONE || '+56987375517').replace(/[^\d]/g, '');
    const message =
      process.env.REACT_APP_WHATSAPP_MESSAGE ||
      'Hola, quiero cotizar una Isapre o revisar mi APV. ¿Me puedes orientar?';
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Por favor, ingresa tu nombre.';
    if (!form.phone.trim()) return 'Por favor, ingresa tu teléfono.';
    if (!form.email.trim()) return 'Por favor, ingresa tu email.';
    // Validación suave (evitamos fricción excesiva).
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Por favor, ingresa un email válido.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ state: 'error', message: error });
      return;
    }

    setStatus({ state: 'loading', message: 'Enviando…' });

    const payload = buildLeadPayload(form);

    try {
      // Requerimiento: cada lead debe enviarse a webhook.
      await sendLeadToWebhook(payload);

      setStatus({
        state: 'success',
        message: 'Listo. Te contactaré con opciones claras y sin presiones.',
      });
      setForm({ name: '', phone: '', email: '', interest: 'isapre' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Lead webhook error:', err);

      const rawMessage = err instanceof Error ? err.message : '';
      const isMissingWebhook = rawMessage.includes('Missing lead webhook config');
      const status = typeof err === 'object' && err && 'status' in err ? err.status : undefined;

      setStatus({
        state: 'error',
        message:
          isMissingWebhook
            ? 'Formulario no configurado: falta URL/origen del webhook. Por favor contáctame por WhatsApp.'
            : status === 404
              ? 'No se pudo enviar: el endpoint del webhook no existe (404). Revisa la URL del workflow.'
            : 'No se pudo enviar el formulario. Intenta nuevamente o escríbeme por WhatsApp.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* NAV: simple, sin distracciones; CTA persistente */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={saludSimpleLogo}
              alt="SiempreSalud"
              className="h-20 sm:h-24 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              loading="eager"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Plataforma de Salud</p>
              <p className="text-xs text-slate-300">Órdenes médicas rápidas y seguras</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/seguros"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 transition"
            >
              Seguros
            </Link>
            <button
              onClick={openWhatsApp}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 transition"
            >
              WhatsApp
            </button>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 transition shadow ring-1 ring-white/10"
            >
              Cotiza gratis
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION (obligatoria) */}
      <section className="relative pt-24 sm:pt-28 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-100 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                Asesoría independiente • Chile • Enfoque transparente
              </p>
              <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                Mejora tu plan de salud o paga menos impuestos, con asesoría clara y sin costo directo
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
                Te ayudo a comparar Isapres y a elegir un APV según tu realidad (no “lo que conviene vender”).
                Lenguaje simple, opciones reales y acompañamiento hasta el cierre.
              </p>

              {/* CTA principal + secundario (obligatorio) */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 transition shadow ring-1 ring-white/10"
                >
                  Habla con un asesor / Cotiza gratis
                </button>
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
                >
                  WhatsApp
                </button>
              </div>

              {/* Micro-confianza (sin promesas irreales) */}
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Sin letra chica</p>
                  <p className="text-xs text-slate-300 mt-1">Transparencia en opciones, costos y condiciones.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Profesional</p>
                  <p className="text-xs text-slate-300 mt-1">Proceso claro, comparación y documentación al día.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">Acompañamiento</p>
                  <p className="text-xs text-slate-300 mt-1">Desde el análisis hasta la implementación.</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                * “Sin costo directo” significa que no pagas honorarios por la asesoría en la mayoría de los casos; cuando corresponde, la remuneración proviene de la institución según normativa y condiciones aplicables.
              </p>
            </div>

            {/* Visual profesional (imagen + overlays estilo "dashboard") */}
            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-to-br from-emerald-400/20 via-cyan-400/15 to-indigo-400/15 blur-3xl rounded-full" />

              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-soft bg-white/5">
                {/* Overlay para contraste consistente del texto (móvil + desktop) */}
                <div className="absolute inset-0 bg-slate-950/55" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/25 via-transparent to-slate-950/10" />
                <img
                  src={heroImage}
                  alt="Asesoría financiera profesional: Isapre, Seguros y APV"
                  className="w-full h-[360px] sm:h-[420px] object-cover opacity-95"
                  loading="eager"
                />

                {/* Overlays */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                    <p className="text-xs text-slate-200">Reporte comparativo</p>
                    <p className="text-sm font-semibold text-white">Opciones claras, en simple</p>
                  </div>
                  <div className="hidden sm:block px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                    <p className="text-xs text-slate-200">Acompañamiento</p>
                    <p className="text-sm font-semibold text-white">De principio a fin</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                    <p className="text-xs text-slate-200">Isapre</p>
                    <p className="text-sm font-semibold text-white">Cobertura • red • costos</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                    <p className="text-xs text-slate-200">APV</p>
                    <p className="text-sm font-semibold text-white">Beneficio tributario responsable</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <p className="text-sm font-semibold text-slate-900">Lo que recibes</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Diagnóstico breve y claro (sin tecnicismos).
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Comparación de opciones reales (coberturas, precio, red).
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Recomendación explicada y acompañamiento en el proceso.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Separador (sin degradé): transición limpia a fondo claro */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-[72px] sm:h-[96px]"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,64 C240,104 480,120 720,96 C960,72 1200,24 1440,40 L1440,120 L0,120 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* PROBLEMA (obligatorio) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">¿Por qué es tan difícil decidir bien?</h2>
            <p className="mt-3 text-slate-600">
              Muchos terminan pagando de más o eligiendo “a ciegas” porque nadie les explica con calma y en simple.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">Planes confusos</p>
              <p className="mt-2 text-sm text-slate-600">
                Coberturas, topes, redes y condiciones que no se entienden rápido.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">Pagos altos</p>
              <p className="mt-2 text-sm text-slate-600">
                El precio sube y no siempre se ajusta a tu uso real o etapa de vida.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">Poca asesoría real</p>
              <p className="mt-2 text-sm text-slate-600">
                Mucha presión, poca explicación. Y eso genera desconfianza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUCIÓN (obligatoria) */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Asesoría clara, paso a paso</h2>
              <p className="mt-3 text-slate-600">
                Mi rol es ayudarte a tomar una decisión informada, con opciones comparables y explicadas.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900">1) Analizo tu perfil</p>
                <p className="mt-1 text-sm text-slate-600">Edad, cargas, uso de prestaciones, presupuesto y prioridades.</p>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900">2) Comparo opciones reales</p>
                <p className="mt-1 text-sm text-slate-600">
                  Te muestro diferencias relevantes: cobertura, red, costos y condiciones (con datos ordenados y comparables).
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900">3) Te acompaño hasta el cierre</p>
                <p className="mt-1 text-sm text-slate-600">Desde la recomendación hasta la contratación y dudas posteriores.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-3xl bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-900">
              <span className="font-semibold">Sin costo para el cliente (directo):</span> en general no cobro honorarios por la asesoría; la remuneración, cuando corresponde, puede provenir de la institución según normativa vigente.
            </p>
          </div>
        </div>
      </section>


      {/* SERVICIOS (obligatorio) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Servicios</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Elige lo que necesitas hoy. Si no estás seguro, selecciona “Revisión gratuita” y lo vemos en el diagnóstico.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">Isapres</p>
              <p className="mt-2 text-sm text-slate-600">Cotización y comparación según tu perfil y red preferida.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Ajuste de precio/cobertura</li>
                <li>• Cambio de plan</li>
                <li>• Acompañamiento en el proceso</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">APV</p>
              <p className="mt-2 text-sm text-slate-600">Estrategia para aprovechar el beneficio tributario de forma responsable.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Elección de régimen (A/B) según tu caso</li>
                <li>• Selección de alternativa acorde a tu perfil</li>
                <li>• Revisión periódica (opcional)</li>
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                * Toda inversión tiene riesgos; no existe rentabilidad garantizada.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="text-lg font-semibold text-slate-900">Revisión gratuita</p>
              <p className="mt-2 text-sm text-slate-600">Diagnóstico de tu situación actual y próximos pasos recomendados.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Qué estás pagando hoy</li>
                <li>• Qué podrías mejorar</li>
                <li>• Qué decisión tiene más sentido ahora</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">¿También necesitas seguros?</p>
                <Link className="text-sm font-semibold text-slate-900 underline hover:text-slate-700" to="/seguros">
                  Ver asesoría en seguros →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (3 PASOS) - obligatorio */}
      <section className="py-14 sm:py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Cómo funciona</h2>
          <p className="mt-3 text-slate-200 max-w-2xl">
            En 3 pasos simples, sin reuniones eternas y sin presión.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-slate-800 border border-slate-700">
              <p className="text-sm font-semibold text-slate-200">Paso 1</p>
              <p className="mt-1 text-lg font-semibold text-white">Solicitas contacto</p>
              <p className="mt-2 text-sm text-slate-300">Formulario o WhatsApp. Me cuentas qué necesitas.</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-800 border border-slate-700">
              <p className="text-sm font-semibold text-slate-200">Paso 2</p>
              <p className="mt-1 text-lg font-semibold text-white">Analizamos tu caso</p>
              <p className="mt-2 text-sm text-slate-300">
                Entiendo tu perfil y prioridades para ofrecerte las mejores opciones (salud, seguros o ahorro).
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-800 border border-slate-700">
              <p className="text-sm font-semibold text-slate-200">Paso 3</p>
              <p className="mt-1 text-lg font-semibold text-white">Te presento la mejor opción</p>
              <p className="mt-2 text-sm text-slate-300">Alternativas comparadas + recomendación explicada.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={scrollToContact}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow"
            >
              Cotiza gratis
            </button>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* DIFERENCIADORES (obligatorio) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Diferenciadores</h2>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="font-semibold text-slate-900">Independiente</p>
              <p className="mt-2 text-sm text-slate-600">Recomendación basada en tu perfil y contexto.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="font-semibold text-slate-900">Sin letra chica</p>
              <p className="mt-2 text-sm text-slate-600">Te explico condiciones en simple, antes de decidir.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="font-semibold text-slate-900">Respuesta rápida</p>
              <p className="mt-2 text-sm text-slate-600">Priorizo claridad y agilidad, sin apurarte.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200">
              <p className="font-semibold text-slate-900">Postventa</p>
              <p className="mt-2 text-sm text-slate-600">Dudas después del cambio/contratación, también las veo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRUEBA DE CONFIANZA (obligatorio) */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Confianza desde el primer minuto</h2>
              <p className="mt-3 text-slate-600">
                En servicios regulados, lo más importante es la transparencia: qué se sabe, qué no se sabe, y qué implica cada alternativa.
              </p>

              <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{advisorName}</span> •{' '}
                  <span className="font-semibold">{experienceYears}+ años</span> de experiencia (placeholder)
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Enfoque ético y transparente: sin presionar decisiones, sin prometer resultados.
                </p>
              </div>
            </div>

            {/* Testimonios placeholders (obligatorio) */}
            <div className="grid gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-700">
                  “Me explicó todo en simple y pude comparar planes sin sentir que me estaban vendiendo.”
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500">— Testimonio (placeholder)</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-700">
                  “Revisamos mi APV y entendí cómo aprovechar el beneficio tributario sin asumir riesgos que no quería.”
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500">— Testimonio (placeholder)</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-700">
                  “Rápido, ordenado y transparente. Me acompañó en todo el proceso.”
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500">— Testimonio (placeholder)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL + FORMULARIO (obligatorio) */}
      <section id="contacto" className="py-14 sm:py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Cotiza o pide asesoría ahora</h2>
              <p className="mt-3 text-slate-600">
                Déjame tus datos y te contacto para entender tu caso. Si prefieres, también puedes escribir por WhatsApp.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  WhatsApp
                </button>
              </div>

              <div className="mt-6 p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600">
                  Tu información se usa solo para contactarte y avanzar en tu solicitud. No hacemos spam ni compartimos datos.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="name">
                    Nombre
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={onChange('name')}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="phone">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={onChange('phone')}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="+56 9 XXXX XXXX"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    value={form.email}
                    onChange={onChange('email')}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="tuemail@dominio.cl"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="interest">
                    Producto de interés
                  </label>
                  <select
                    id="interest"
                    value={form.interest}
                    onChange={onChange('interest')}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="isapre">Isapre</option>
                    <option value="apv">APV</option>
                    <option value="seguros">Seguros</option>
                    <option value="revision">Revisión gratuita</option>
                  </select>
                </div>

                {status.state !== 'idle' && (
                  <div
                    className={[
                      'rounded-2xl px-4 py-3 text-sm border',
                      status.state === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : status.state === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700',
                    ].join(' ')}
                    role="status"
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.state === 'loading'}
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status.state === 'loading' ? 'Enviando…' : 'Enviar y solicitar contacto'}
                </button>

                <p className="text-xs text-slate-500">
                  Al enviar, aceptas ser contactado para fines de cotización/asesoría. Puedes solicitar la eliminación de tus datos escribiendo a{' '}
                  <a className="underline" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER (obligatorio) */}
      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Plataforma de Salud — Chile</p>
            <p className="mt-1 text-xs text-slate-600">
              Aviso legal: La información entregada es referencial y no constituye una oferta vinculante.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Contacto: <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </div>
        </div>
      </footer>

      {/* CTAs flotantes */}
      <FinancialWhatsAppFloat />
      <BackToTop />
    </div>
  );
}

export default MainLanding;
