import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import muj4Image from '../assets/muj4.png';

const PrivaxPage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  const name = t('modulesOld.privax.name', language) || 'Privax';

  const pricingData = t('privaxPage.pricing', language) || {};
  const pricing = [
    pricingData.basic,
    pricingData.pro,
    pricingData.custom
  ].filter(Boolean);

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
                src={muj4Image} 
                alt="Privacidad y Cumplimiento" 
                className="w-[28rem] md:w-[40rem] h-auto rounded-2xl border-4 border-black shadow-2xl object-contain bg-black/40 p-2"
              />
            </div>
            
            {/* Contenido a la derecha */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{name}</h1>
              <p className="text-xl text-blue-200 mb-4 font-semibold">{t('privaxPage.tagline', language)}</p>
              <p className="text-gray-300 text-lg leading-relaxed">
                {t('privaxPage.description', language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('privaxPage.problemTitle', language)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('privaxPage.problemItems', language) || []).map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solución */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('privaxPage.solutionTitle', language)}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(t('privaxPage.solutionCards', language) || []).map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-300">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <button
              onClick={onOpenDemo}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {t('privaxPage.requestDemo', language)}
            </button>
          </div>
        </div>
      </section>

      {/* Características de Privax */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('privaxPage.featuresTitle', language)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('modulesOld.privax.features', language) || []).map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-200">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados y beneficios */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t('privaxPage.benefitsTitle', language)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(t('privaxPage.benefits', language) || []).map((benefit, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-10">{t('privaxPage.pricingTitle', language)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div key={p.plan} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                <h3 className="text-white text-xl font-bold mb-1">{p.plan}</h3>
                {p.customText ? (
                  <p className="text-gray-300 text-lg mb-6">{p.customText}</p>
                ) : (
                  <>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">{p.price}</div>
                    {p.installationCost && (
                      <div className="text-sm text-gray-400 mb-4">{t('privaxPage.installationCost', language)} <span className="text-gray-300 font-semibold">{p.installationCost}</span></div>
                    )}
                <ul className="text-gray-300 space-y-2 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                  </>
                )}
                <button
                  onClick={onOpenDemo}
                  className="mt-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors"
                >
                  {t('privaxPage.requestDemo', language)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivaxPage;


