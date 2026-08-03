import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const MineriaPage = ({ onOpenDemo }) => {
  const { language } = useLanguage();
  const donutRef = useRef(null);

  useEffect(() => {
    // Animate donut chart on mount
    if (donutRef.current) {
      const circle = donutRef.current.querySelector('.donut-circle');
      if (circle) {
        setTimeout(() => {
          circle.style.transition = 'stroke-dashoffset 2s ease-out';
          // 57% of 502.65 (circumference = 2 * π * 80)
          circle.style.strokeDashoffset = '215.49';
        }, 100);
      }
    }
  }, []);

  const problemaItems = t('mineriaPage.problema.items', language) || [];
  const soluciones = t('mineriaPage.solucion.items', language) || [];

  return (
    <main className="pt-8">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-black">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              {t('mineriaPage.hero.title', language)}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {t('mineriaPage.hero.titleHighlight', language)}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('mineriaPage.hero.description', language)}
            </p>
            <button
              onClick={onOpenDemo}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('mineriaPage.hero.cta', language)}
            </button>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
            {t('mineriaPage.problema.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center">
            {t('mineriaPage.problema.subtitle', language)}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {problemaItems.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-200 hover:bg-white/10 transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>

          {/* Gráfico circular */}
          <div className="flex justify-center items-center flex-col">
            <div ref={donutRef} className="relative">
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#0b1c38"
                  strokeWidth="20"
                  fill="none"
                />
                <circle
                  className="donut-circle"
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#ff4d4d"
                  strokeWidth="20"
                  strokeDasharray="502"
                  strokeDashoffset="502"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-2xl font-black">{t('mineriaPage.problema.lossPercentage', language)}</p>
              </div>
            </div>
            <p className="text-gray-400 mt-4 text-lg">{t('mineriaPage.problema.lossLabel', language)}</p>
          </div>
        </div>
      </section>

      {/* Solución */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
            {t('mineriaPage.solucion.title', language)}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {soluciones.map((sol, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">{sol.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{sol.title}</h3>
                <p className="text-gray-300 leading-relaxed">{sol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">
            {t('mineriaPage.metodologia.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center">
            {t('mineriaPage.metodologia.subtitle', language)}
          </p>

          {/* Pasos */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('mineriaPage.metodologia.step1.title', language)}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('mineriaPage.metodologia.step1.description', language)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('mineriaPage.metodologia.step2.title', language)}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('mineriaPage.metodologia.step2.description', language)}
              </p>
            </div>
          </div>

          {/* Procesos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {t('mineriaPage.metodologia.procesos.title', language)}
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              {t('mineriaPage.metodologia.procesos.description', language)}
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(t('mineriaPage.metodologia.procesos.items', language) || []).map((proceso, i) => (
                <div key={i} className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-white font-semibold">{proceso}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Integración */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {t('mineriaPage.metodologia.integracion.title', language)}
            </h3>
            <p className="text-gray-300 leading-relaxed text-center max-w-4xl mx-auto mb-6">
              {t('mineriaPage.metodologia.integracion.description', language)}
            </p>
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4 text-center">
                {t('mineriaPage.metodologia.integracion.platformsTitle', language)}
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {(t('mineriaPage.metodologia.integracion.platforms', language) || []).map((platform, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors">
                    {platform}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagrama */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
            {t('mineriaPage.diagrama.title', language)}
          </h2>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 min-w-[600px]">
              {/* Dolores */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-4 text-center">
                  {t('mineriaPage.diagrama.dolores.title', language)}
                </h3>
                <div className="space-y-2">
                  {(t('mineriaPage.diagrama.dolores.items', language) || []).map((item, i) => (
                    <div key={i} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-gray-200 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flecha */}
              <div className="flex-shrink-0">
                <svg width="60" height="60" className="text-blue-400">
                  <path
                    d="M10 30 L50 30 M40 20 L50 30 L40 40"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Soluciones */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
                  {t('mineriaPage.diagrama.soluciones.title', language)}
                </h3>
                <div className="space-y-2">
                  {(t('mineriaPage.diagrama.soluciones.items', language) || []).map((item, i) => (
                    <div key={i} className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-gray-200 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mining Industry Section */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
            {t('mineriaPage.industry.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center max-w-4xl mx-auto leading-relaxed">
            {t('mineriaPage.industry.intro', language)}
          </p>
        </div>
      </section>

      {/* Common Challenges */}
      <section className="py-16 bg-gradient-to-b from-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
            {t('mineriaPage.industry.challenges.title', language)}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('mineriaPage.industry.challenges.items', language) || []).map((challenge, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-3">
                  {challenge.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Support */}
      <section className="py-16 bg-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
            {t('mineriaPage.industry.support.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
            {t('mineriaPage.industry.support.description', language)}
          </p>
          <div className="bg-white/5 border border-blue-500/30 rounded-xl p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔗</div>
                <p className="text-white font-semibold mb-2">{t('mineriaPage.industry.support.point1.title', language)}</p>
                <p className="text-gray-400 text-sm">{t('mineriaPage.industry.support.point1.description', language)}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🧠</div>
                <p className="text-white font-semibold mb-2">{t('mineriaPage.industry.support.point2.title', language)}</p>
                <p className="text-gray-400 text-sm">{t('mineriaPage.industry.support.point2.description', language)}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🚫</div>
                <p className="text-white font-semibold mb-2">{t('mineriaPage.industry.support.point3.title', language)}</p>
                <p className="text-gray-400 text-sm">{t('mineriaPage.industry.support.point3.description', language)}</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-lg text-blue-400 font-semibold text-center">
                {t('mineriaPage.industry.support.tagline', language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
            {t('mineriaPage.industry.useCases.title', language)}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(t('mineriaPage.industry.useCases.items', language) || []).map((useCase, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance, Safety and Compliance */}
      <section className="py-16 bg-gradient-to-b from-[#072029] to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
            {t('mineriaPage.industry.governance.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
            {t('mineriaPage.industry.governance.description', language)}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {(t('mineriaPage.industry.governance.items', language) || []).map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
            {t('mineriaPage.industry.outcomes.title', language)}
          </h2>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
            {t('mineriaPage.industry.outcomes.description', language)}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('mineriaPage.industry.outcomes.items', language) || []).map((outcome, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-3">
                  {outcome.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {outcome.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MineriaPage;

