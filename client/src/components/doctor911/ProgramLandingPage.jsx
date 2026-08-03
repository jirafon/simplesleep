import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import SaludSimpleFooter from './SaludSimpleFooter';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { buildLeadPayload, sendLeadToWebhook } from '../../services/leadWebhookService';

function ProgramLandingPage({
  badge,
  title,
  subtitle,
  heroGradient,
  highlights,
  cards,
  primaryCta,
  secondaryCta,
  note,
  leadForm
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    option: leadForm?.options?.[0] || '',
    notes: ''
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });

    const composedNotes = [
      `Programa: ${title}`,
      formData.option ? `${leadForm.optionLabel || 'Objetivo'}: ${formData.option}` : '',
      formData.notes ? `Notas: ${formData.notes}` : ''
    ]
      .filter(Boolean)
      .join(' | ');

    const payload = buildLeadPayload({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      interest: leadForm.interest || 'revision',
      notes: composedNotes
    });

    try {
      await sendLeadToWebhook(payload);
      setStatus({ state: 'success', message: leadForm.successMessage || 'Solicitud enviada correctamente. Te contactaremos pronto.' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        option: leadForm?.options?.[0] || '',
        notes: ''
      });
    } catch (error) {
      const fallback = 'No se pudo enviar la solicitud. Intenta nuevamente o contáctanos por WhatsApp.';
      setStatus({ state: 'error', message: error?.message || fallback });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-4 py-10 md:py-14">
        <section className={`max-w-6xl mx-auto rounded-3xl p-8 md:p-10 text-white shadow-2xl bg-gradient-to-r ${heroGradient}`}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-5">
            {badge}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{title}</h1>
          <p className="text-white/90 text-base md:text-xl max-w-3xl">{subtitle}</p>

          <div className="flex flex-wrap gap-3 mt-8">
            {highlights.map((item) => (
              <span key={item} className="inline-flex items-center text-sm font-medium rounded-full border border-white/25 bg-white/10 px-4 py-2">
                <FaCheckCircle className="mr-2" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-8 grid md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <article key={card.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-slate-700">{note}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={primaryCta.href}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black transition"
              >
                {primaryCta.label}
                <FaArrowRight className="text-sm" />
              </Link>
              <Link
                to={secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        {leadForm && (
          <section className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{leadForm.title}</h2>
              <p className="text-slate-600">{leadForm.description}</p>
            </div>

            {status.message && (
              <div
                className={`mb-5 px-4 py-3 rounded-lg border text-sm ${
                  status.state === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : status.state === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleLeadSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {leadForm.options?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{leadForm.optionLabel || 'Objetivo principal'} *</label>
                  <select
                    name="option"
                    value={formData.option}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {leadForm.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Comentario adicional</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Cuéntanos tu objetivo o cualquier dato relevante"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={status.state === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black transition disabled:opacity-60"
                >
                  {status.state === 'loading' ? 'Enviando...' : (leadForm.submitLabel || 'Enviar solicitud')}
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <SaludSimpleFooter />
    </div>
  );
}

export default ProgramLandingPage;
