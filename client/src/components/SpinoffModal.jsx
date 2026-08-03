import React from 'react';

const SpinoffModal = ({ spinoff, onClose, onOpenDemo }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 relative animate-fadeIn border border-blue-100">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-t-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 z-10"
          aria-label="Cerrar modal"
        >
          ×
        </button>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
            {spinoff.logo ? (
              <img src={spinoff.logo} alt={spinoff.name} className="w-16 h-16 rounded-xl" />
            ) : (
              <span className="text-4xl font-bold text-white">{spinoff.name[0]}</span>
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-sm">{spinoff.name}</h2>
            <p className="text-blue-100 text-xl font-medium max-w-2xl">{spinoff.tagline}</p>
            {/* Logo Vizora debajo del tagline solo para Vizora */}
            {spinoff.name === 'Vizora' && (
              <div className="flex justify-center md:justify-start mt-4">
                <img src={require('../assets/vizorablack.png')} alt="Vizora logo" className="w-20 h-20 rounded-xl shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-10 space-y-10">
        {/* Problema y solución */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border border-red-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-red-800">Problema</h3>
            </div>
            <p className="text-red-700 leading-relaxed text-lg">{spinoff.description}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-green-800">Solución</h3>
            </div>
            <p className="text-green-700 font-semibold leading-relaxed text-lg">{spinoff.keyBenefit}</p>
          </div>
        </div>

        {/* Características */}
        {spinoff.features && spinoff.features.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-800">Características Principales</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {spinoff.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/60 rounded-xl p-4 border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-blue-700 font-medium text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje de ventas */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <p className="text-2xl font-semibold italic leading-relaxed">{spinoff.salesMessage}</p>
        </div>

        {/* Tabla de precios mejorada */}
        {/* Enlaces y botones */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6 pb-4">
          {spinoff.link && (
            <a 
              href={spinoff.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-10 py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 hover:scale-105 transition-all duration-200 shadow-lg text-lg"
            >
              <span>🌐</span>
              Ver sitio web
            </a>
          )}
        </div>

        
      </div>
    </div>
    
    {/* Overlay para cerrar */}
    <div className="fixed inset-0 z-40" onClick={onClose}></div>
  </div>
);

export default SpinoffModal; 