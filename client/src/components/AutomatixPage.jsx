import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import automatixImage from '../assets/automatix.png';

const AutomatixPage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  const name = t('modulesOld.automatix.name', language) || 'Automatix';
  const keyBenefit = t('modulesOld.automatix.keyBenefit', language);
  const salesMessage = t('modulesOld.automatix.salesMessage', language);
  const features = t('modulesOld.automatix.features', language) || [];
  const problem = t('modulesOld.automatix.problem', language) || {};

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
                src={automatixImage} 
                alt="Automatización Inteligente" 
                className="w-[32rem] h-[28rem] md:w-[40rem] md:h-[36rem] rounded-2xl border-4 border-black shadow-2xl object-cover"
              />
            </div>
            
            {/* Contenido a la derecha */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{name}</h1>
              <p className="text-xl text-blue-200 mb-4 font-semibold">{t('automatixPage.tagline', language)}</p>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t('automatixPage.description', language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('automatixPage.problemTitle', language)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {problem.statement && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <p className="text-gray-200 leading-relaxed">{problem.statement}</p>
                </div>
              )}
              {Array.isArray(problem.symptoms) && problem.symptoms.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3">{t('automatixPage.symptoms', language)}</h3>
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
                  <h3 className="text-white font-semibold mb-3">{t('automatixPage.impact', language)}</h3>
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
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('automatixPage.solutionTitle', language)}</h2>
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
                {t('automatixPage.requestDemo', language)}
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* Características tipo n8n */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('automatixPage.featuresTitle', language)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(features) ? features : []).map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-200">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ejemplo de Servicio */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-10">{t('automatixPage.exampleService.sectionTitle', language)}</h2>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {t('automatixPage.exampleService.title', language)}
            </h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                {t('automatixPage.exampleService.description', language)}
              </p>
              <p>
                {t('automatixPage.exampleService.crmFeatures', language)}
              </p>
              <p className="text-blue-300 font-semibold">
                {t('automatixPage.exampleService.useCases', language)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AutomatixPage;


