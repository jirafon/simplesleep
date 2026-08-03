import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const ResponsibleAI = () => {
  const { language } = useLanguage();
  
  const pillarsData = t('responsibleAI.pillars', language) || [];
  const pillars = pillarsData.map((p, i) => ({
    ...p,
    icon: ["🗂️", "🔍", "✅", "📋"][i],
    color: ["from-blue-500 to-blue-700", "from-purple-500 to-purple-700", "from-green-500 to-green-700", "from-orange-500 to-orange-700"][i]
  }));

  const risks = t('responsibleAI.risks', language) || [];

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#131369] via-black to-[#09184a] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgb(59, 130, 246) 3px, transparent 3px)`,
            backgroundSize: '80px 80px'
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with side image */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="order-2 md:order-2 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <span className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {t('responsibleAI.badge', language)}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-300 mb-6">
                  {t('responsibleAI.title', language)}<br />{t('responsibleAI.titleHighlight', language)}
                </h2>
                <p className="text-xl text-gray-300 md:max-w-3xl">
                  {t('responsibleAI.description', language)}<br />
                  <span className="text-green-400 font-semibold">{t('responsibleAI.descriptionHighlight', language)}</span>
                </p>
              </motion.div>
            </div>
            <div className="order-1 md:order-1 w-1/2 md:w-1/3">
              <img
                src="/botr1.png"
                alt="IA Responsable"
                className="w-full rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">
                  {pillar.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {pillar.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                      <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 bg-gradient-to-r ${pillar.color} bg-clip-text text-transparent`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk mitigation table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t('responsibleAI.risksTitle', language)}
          </h3>
          <div className="space-y-4">
            {risks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-gradient-to-r from-red-900/20 to-green-900/20 rounded-xl p-4 border border-gray-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-red-300 font-semibold">{item.risk}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="hidden md:block w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-300 font-semibold">{item.solution}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {(t('responsibleAI.stats', language) || []).map((stat, index) => {
            const colors = ["from-blue-400 to-blue-600", "from-green-400 to-green-600", "from-purple-400 to-purple-600"];
            return { ...stat, color: colors[index] };
          }).map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6">
              <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ResponsibleAI;
