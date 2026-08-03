import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import mujsmartImage from '../assets/mujsmart.png';

const SmartriskPage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  const name = t('modulesOld.smartrisk.name', language) || 'Smartrisk';
  const keyBenefit = t('modulesOld.smartrisk.keyBenefit', language);
  const salesMessage = t('modulesOld.smartrisk.salesMessage', language);
  const features = t('modulesOld.smartrisk.features', language) || [];
  const problem = t('modulesOld.smartrisk.problem', language) || {};

  const pricingGroups = t('smartriskPage.pricingGroups', language) || [];
  const visiblePricingGroups = pricingGroups.filter((g) => 
    g.title.startsWith('SmartRisk') || g.title.startsWith('Prevención del Delito') || g.title.startsWith('Crime Prevention')
  );

  return (
    <main className="pt-8">
      {/* Header */}
      <section className="relative py-16 md:py-20 bg-black">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Imagen a la izquierda */}
            <div className="flex-shrink-0">
              <img 
                src={mujsmartImage} 
                alt={t('smartriskPage.imageAlt', language)} 
                className="w-[32rem] h-[28rem] md:w-[40rem] md:h-[36rem] rounded-2xl shadow-2xl object-cover"
              />
            </div>
            
            {/* Contenido a la derecha */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{name}</h1>
              <p className="text-xl text-blue-200 mb-4 font-semibold">{t('smartriskPage.tagline', language)}</p>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t('smartriskPage.description', language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('smartriskPage.problemTitle', language)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {problem.statement && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <p className="text-gray-200 leading-relaxed">{problem.statement}</p>
                </div>
              )}
              {Array.isArray(problem.symptoms) && problem.symptoms.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3">{t('smartriskPage.symptoms', language)}</h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {problem.symptoms.slice(0,6).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <aside className="space-y-4">
              {Array.isArray(problem.impact) && problem.impact.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3">{t('smartriskPage.impact', language)}</h3>
                  <ul className="space-y-1 text-gray-300">
                    {problem.impact.slice(0,5).map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Solución */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('smartriskPage.solutionTitle', language)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                <p className="text-green-200 text-lg font-semibold mb-2">{keyBenefit}</p>
                {salesMessage && <p className="text-gray-300">{salesMessage}</p>}
              </div>
            </div>
            <aside className="space-y-4">
              <button
                onClick={onOpenDemo}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t('smartriskPage.requestDemo', language)}
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* Opciones agregables */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('smartriskPage.addOnsTitle', language)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('smartriskPage.addOns', language) || []).map((opt, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{opt.title}</h3>
                <p className="text-gray-300">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo interactivo MPD */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Nuevo · SmartRisk × Eticpro
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-3 mb-3">
                Cobertura MPD por Delito y Control
              </h2>
              <p className="text-gray-400 max-w-xl leading-relaxed">
                Cruza delitos aplicables, criticidad de la matriz y controles prediseñados Eticpro.
                Reporta % de riesgo penal crítico mitigado y genera brechas automáticas.
              </p>
            </div>
            <Link
              to="/smartrisk/cobertura-mpd"
              className="inline-flex items-center justify-center shrink-0 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Ver mock interactivo →
            </Link>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('smartriskPage.featuresTitle', language)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(features) ? features : []).map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-200">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-10">{t('smartriskPage.pricingTitle', language)}</h2>
          {visiblePricingGroups.map((group, gIdx) => (
            <div key={gIdx} className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6">{group.title}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {group.plans.map((p) => (
                  <div key={p.plan} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h4 className="text-white text-xl font-bold mb-1">{p.plan}</h4>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">{p.price}</div>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      {p.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={onOpenDemo}
                      className="mt-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors"
                    >
                      {t('smartriskPage.requestDemo', language)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SmartriskPage;


