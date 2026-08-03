import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const AnchorPromise = () => {
  const { language } = useLanguage();

  const promiseElements = [
    { key: 'scope', icon: '📋' },
    { key: 'timeframe', icon: '⏱️' },
    { key: 'safety', icon: '🔒' },
    { key: 'result', icon: '✅' }
  ];

  return (
    <section className="relative py-16 bg-gradient-to-r from-blue-900/20 via-[#072029] to-blue-900/20 border-y border-blue-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {t('anchorPromise.title', language)}
          </h2>
          <p className="text-xl md:text-2xl text-blue-400 font-semibold mb-8 max-w-4xl mx-auto leading-relaxed">
            {t('anchorPromise.promise', language)}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {promiseElements.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm text-gray-300 font-medium">
                  {t(`anchorPromise.${item.key}`, language)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnchorPromise;

