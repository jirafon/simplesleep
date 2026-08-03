import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const StartupModal = ({ startup, onClose }) => {
  const { language } = useLanguage();
  const featuresList = Array.isArray(startup.features)
    ? startup.features
    : (typeof startup.features === 'string' ? [startup.features] : []);
  
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" role="dialog" aria-modal="true">
    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full relative animate-fadeIn border border-gray-100 max-h-[85vh] overflow-hidden">
      {/* Header minimal */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          {startup.logo ? (
            <img src={startup.logo} alt={startup.name} className="w-8 h-8 object-contain" />
          ) : (
            <span className="text-lg font-bold text-gray-700">{startup.name[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{startup.name}</h2>
          <p className="text-gray-600 text-sm">{startup.tagline}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Cerrar modal"
        >
          ×
        </button>
      </div>

      {/* Contenido principal compacto: 2 columnas, sin scroll */}
      <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
        {/* Izquierda: resumen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {startup.problem?.statement && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <h3 className="text-red-800 font-semibold mb-1">{t('modal.problem', language)}</h3>
                <p className="text-red-700 leading-relaxed line-clamp-5">{startup.problem.statement}</p>
              </div>
            )}
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <h3 className="text-green-800 font-semibold mb-1">{t('modal.solution', language)}</h3>
              <p className="text-green-700 leading-relaxed line-clamp-5">{startup.keyBenefit}</p>
            </div>
              </div>
              
          {featuresList.length > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h3 className="text-blue-800 font-semibold mb-2">{t('modal.features', language)}</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {featuresList.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white rounded-md border border-blue-100 p-2">
                    <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-blue-900">{feature}</span>
                  </li>
                ))}
              </ul>
          </div>
        )}
        
          {startup.salesMessage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-gray-800">{startup.salesMessage}</p>
            </div>
          )}
        </div>

        {/* Derecha: ficha */}
        <aside>
          <div className="space-y-3">
            {startup.submodules && startup.submodules.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h4 className="text-gray-700 font-semibold mb-2">Módulos</h4>
                <div className="flex flex-wrap gap-2">
                  {startup.submodules.map((m, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-200 text-gray-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {startup.featuresShort && startup.featuresShort.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h4 className="text-gray-700 font-semibold mb-2">Highlights</h4>
                <ul className="space-y-1 text-gray-800">
                  {startup.featuresShort.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
          </div>
        )}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
          {startup.link && (
            <a 
              href={startup.link} 
              target="_blank" 
              rel="noopener noreferrer" 
                  className="w-full inline-flex items-center justify-center bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md font-semibold transition-colors"
            >
              {t('modal.viewWebsite', language)}
            </a>
          )}
        </div>
        </div>
        </aside>
      </div>
    </div>
    
    {/* Overlay para cerrar */}
    <div className="fixed inset-0 z-40" onClick={onClose}></div>
  </div>
  );
};

export default StartupModal; 