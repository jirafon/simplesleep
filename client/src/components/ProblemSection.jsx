import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const ProblemSection = () => {
  const { language } = useLanguage();

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t('problem.title', language)}<br />
            <span className="text-red-500">{t('problem.titleHighlight', language)}</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {t('problem.description', language)}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl px-8 py-6 backdrop-blur-sm"
          >
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              {t('problem.highlight', language)}
            </p>
          </motion.div>
        </motion.div>

        {/* Pain points grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            {
              icon: "🔍",
              titleKey: "pain1Title",
              descKey: "pain1Desc"
            },
            {
              icon: "🏢",
              titleKey: "pain2Title",
              descKey: "pain2Desc"
            },
            {
              icon: "📊",
              titleKey: "pain3Title",
              descKey: "pain3Desc"
            },
            {
              icon: "👔",
              titleKey: "pain4Title",
              descKey: "pain4Desc"
            },
            {
              icon: "🛡️",
              titleKey: "pain5Title",
              descKey: "pain5Desc"
            }
          ].map((pain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{pain.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{t(`problem.${pain.titleKey}`, language)}</h3>
              <p className="text-gray-400 text-sm">{t(`problem.${pain.descKey}`, language)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
