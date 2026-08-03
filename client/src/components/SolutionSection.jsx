import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const SolutionSection = () => {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: "✓",
      textKey: "benefit1",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "✓",
      textKey: "benefit2",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "✓",
      textKey: "benefit3",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "✓",
      textKey: "benefit4",
      color: "from-cyan-500 to-cyan-600"
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
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
            <span className="text-blue-300 text-sm font-semibold">{t('solution.badge', language)}</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('solution.title', language)}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('solution.titleHighlight', language)}
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('solution.description', language)}
          </p>
        </motion.div>

        {/* Benefits list */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30 hover:transform hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {benefit.icon}
                </div>
                <p className="text-white text-lg font-medium leading-relaxed">
                  {t(`solution.${benefit.textKey}`, language)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value proposition highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl px-8 py-8 backdrop-blur-sm max-w-3xl">
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
              {t('solution.valueTitle', language)}
            </p>
            <p className="text-lg text-gray-300 mt-4">
              {t('solution.valueDesc', language)}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
