import React from 'react';
import { motion } from 'framer-motion';

const DashboardsToAction = () => {
  const features = [
    {
      icon: "📊",
      title: "Power BI muestra",
      subtitle: "Dashboards estáticos",
      description: "Indicadores históricos sin capacidad de acción",
      isUnbiax: false
    },
    {
      icon: "⚡",
      title: "Unbiax gestiona",
      subtitle: "Acción automatizada",
      description: "Convierte indicadores en tareas, responsables y evidencias",
      isUnbiax: true
    }
  ];

  const capabilities = [
    {
      icon: "🎯",
      title: "Automatiza flujos",
      description: "Cada evento crítico genera un workflow automático con responsables asignados"
    },
    {
      icon: "👥",
      title: "Asigna responsables",
      description: "Distribución inteligente de tareas según roles, expertise y disponibilidad"
    },
    {
      icon: "✅",
      title: "Rastrea tareas",
      description: "Seguimiento en tiempo real del estado y avance de cada acción"
    },
    {
      icon: "📁",
      title: "Captura evidencias",
      description: "Registro automático de documentos, firmas y timestamps para auditoría"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-[#09184a] to-[#131369] overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px), linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            De indicadores a acción
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 mb-6">
            Power BI muestra.<br />Unbiax gestiona.
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Los dashboards te muestran qué está pasando.<br />
            <span className="text-purple-400 font-semibold">Unbiax te dice qué hacer y automatiza la respuesta.</span>
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative rounded-2xl p-8 ${
                feature.isUnbiax
                  ? 'bg-gradient-to-br from-blue-600/90 to-purple-600/90 border-2 border-blue-400/50 shadow-2xl shadow-blue-500/25'
                  : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-gray-700/50'
              } backdrop-blur-sm overflow-hidden group`}
            >
              {/* Glow effect for Unbiax card */}
              {feature.isUnbiax && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}

              <div className="relative z-10">
                {/* Badge */}
                {feature.isUnbiax && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    ✓ Recomendado
                  </div>
                )}

                {/* Icon */}
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className={`text-3xl font-black mb-2 ${
                  feature.isUnbiax ? 'text-white' : 'text-gray-300'
                }`}>
                  {feature.title}
                </h3>

                {/* Subtitle */}
                <div className={`text-sm font-semibold mb-4 ${
                  feature.isUnbiax ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {feature.subtitle}
                </div>

                {/* Description */}
                <p className={`text-lg ${
                  feature.isUnbiax ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Capabilities grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Cómo Unbiax convierte datos en decisiones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {capability.icon}
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-white mb-2">
                  {capability.title}
                </h4>

                {/* Description */}
                <p className="text-gray-400 text-sm">
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Example flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Ejemplo: De indicador a acción en segundos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Alerta detectada", desc: "Riesgo crítico identificado en dashboard" },
              { step: "2", title: "Workflow activado", desc: "Proceso automático se dispara" },
              { step: "3", title: "Tareas asignadas", desc: "Responsables notificados con SLA" },
              { step: "4", title: "Evidencia capturada", desc: "Registro completo para auditoría" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center h-full">
                  <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    {item.title}
                  </h4>
                  <p className="text-blue-200 text-sm">
                    {item.desc}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardsToAction;
