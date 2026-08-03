import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackToTop from '../components/BackToTop';
import FinancialWhatsAppFloat from '../components/FinancialWhatsAppFloat';
import { buildLeadPayload, sendLeadToWebhook } from '../services/leadWebhookService';
import logoDecideBien from '../assets/decidebien1.png';

/**
 * Landing secundaria (hoja adicional): Seguros
 * Objetivo: captación de leads para seguros, sin mezclar la propuesta principal (Isapre/APV).
 */
function SegurosLanding() {
  const contactEmail = 'contacto@unbiax.com';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'seguros',
    insuranceType: 'vida',
    notes: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const openWhatsApp = () => {
    const rawPhone = (process.env.REACT_APP_WHATSAPP_PHONE || '+56987375517').replace(/[^\d]/g, '');
    const message =
      process.env.REACT_APP_WHATSAPP_MESSAGE ||
      'Hola, quiero revisar seguros (vida, salud complementario, catastrófico, auto u hogar). ¿Me puedes orientar?';
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Por favor, ingresa tu nombre.';
    if (!form.phone.trim()) return 'Por favor, ingresa tu teléfono.';
    if (!form.email.trim()) return 'Por favor, ingresa tu email.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Por favor, ingresa un email válido.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return setStatus({ state: 'error', message: error });

    setStatus({ state: 'loading', message: 'Enviando…' });
    try {
      await sendLeadToWebhook(buildLeadPayload(form));
      setStatus({ state: 'success', message: 'Listo. Te contactaré para entender tu caso.' });
      setForm({ name: '', phone: '', email: '', interest: 'seguros', insuranceType: 'vida', notes: '' });
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
            : 'No se pudo enviar. Intenta nuevamente o escríbeme por WhatsApp.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoDecideBien}
              alt="DecideBien"
              className="h-8 sm:h-9 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              loading="eager"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Seguros</p>
              <p className="text-xs text-slate-300">Orientación clara y sin presión</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 transition"
            >
              Volver
            </Link>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 transition shadow ring-1 ring-white/10"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-24 sm:pt-28 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-100 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                Seguros • Comparación clara • Sin letra chica
              </p>
              <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                Elige tu seguro con calma: coberturas, costos y exclusiones explicadas en simple
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
                Te ayudo a entender alternativas y a elegir según tu etapa de vida y presupuesto. Sin presiones y sin prometer
                “milagros”.
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Tipos: <span className="font-semibold text-white">Vida</span>,{' '}
                <span className="font-semibold text-white">Salud complementario</span>,{' '}
                <span className="font-semibold text-white">Catastrófico</span>,{' '}
                <span className="font-semibold text-white">Auto</span> y{' '}
                <span className="font-semibold text-white">Hogar</span>.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 transition shadow ring-1 ring-white/10"
                >
                  Solicitar asesoría
                </a>
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-to-br from-emerald-400/20 via-cyan-400/15 to-indigo-400/15 blur-3xl rounded-full" />
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-soft">
                <p className="text-sm font-semibold text-white">Qué revisamos contigo</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Coberturas y exclusiones (lo que sí y lo que no cubre).
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Costos, deducibles y condiciones importantes.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Recomendación según tu perfil (sin “venta agresiva”).
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
                      ✓
                    </span>
                    Data Management: ordenamos tu información para comparar en simple y con trazabilidad.
                  </li>
                </ul>
                <p className="mt-6 text-xs text-slate-300">
                  * La información es referencial y no constituye una oferta vinculante.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="leading-none">
          <svg viewBox="0 0 1440 120" className="w-full h-[72px] sm:h-[96px]" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,64 C240,104 480,120 720,96 C960,72 1200,24 1440,40 L1440,120 L0,120 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* CTA + Form */}
      <section id="contacto" className="py-14 sm:py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Cuéntame qué seguro necesitas</h2>
              <p className="mt-3 text-slate-600">
                Te contacto para entender tu caso y mostrarte alternativas comparables.
              </p>
              <div className="mt-6 p-5 rounded-3xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600">
                  Usamos tus datos solo para contactarte. Puedes solicitar eliminación escribiendo a{' '}
                  <a className="underline" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-soft">
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
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="insuranceType">
                    Tipo de seguro
                  </label>
                  <select
                    id="insuranceType"
                    value={form.insuranceType}
                    onChange={onChange('insuranceType')}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="vida">Vida</option>
                    <option value="salud_complementario">Salud complementario</option>
                    <option value="catastrofico">Catastrófico</option>
                    <option value="auto">Auto</option>
                    <option value="hogar">Hogar</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Si necesitas más de uno, envía este y lo ampliamos por WhatsApp.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="notes">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={onChange('notes')}
                    className="mt-2 w-full min-h-[96px] rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="Ej: edad aproximada, cargas, presupuesto, si ya tienes un seguro, etc."
                  />
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
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Seguros — Chile</p>
            <p className="mt-1 text-xs text-slate-600">
              Aviso legal: La información entregada es referencial y no constituye una oferta vinculante.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            <Link className="underline" to="/">
              Volver a Isapre/APV
            </Link>
          </div>
        </div>
      </footer>

      <FinancialWhatsAppFloat />
      <BackToTop />
    </div>
  );
}

export default SegurosLanding;

