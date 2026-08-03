import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const DigitalTransformationSection = () => {
  const { language } = useLanguage();

  const capabilities = [
    {
      icon: "🔄",
      titleKey: "capability1Title",
      descKey: "capability1Desc",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🔧",
      titleKey: "capability2Title",
      descKey: "capability2Desc",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📊",
      titleKey: "capability3Title",
      descKey: "capability3Desc",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-[#09184a] to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
            <span className="text-blue-300 text-sm font-semibold">{t('digitalTransformation.badge', language)}</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('digitalTransformation.title', language)}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('digitalTransformation.titleHighlight', language)}
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            {t('digitalTransformation.description', language)}
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            {t('digitalTransformation.description2', language)}
          </p>
        </motion.div>

        {/* Capabilities grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30 hover:transform hover:scale-105"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${capability.color} mb-6 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {capability.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t(`digitalTransformation.${capability.titleKey}`, language)}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t(`digitalTransformation.${capability.descKey}`, language)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Legacy software refactoring highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8"
        >
          <div className="flex items-start gap-6">
            <div className="text-5xl">🔄</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('digitalTransformation.legacyTitle', language)}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('digitalTransformation.legacyDescription', language)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalTransformationSection;


