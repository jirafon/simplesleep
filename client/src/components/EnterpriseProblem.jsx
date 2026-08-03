import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const EnterpriseProblem = () => {
  const { language } = useLanguage();

  const pains = [
    { key: 'pain1' },
    { key: 'pain2' },
    { key: 'pain3' },
    { key: 'pain4' }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-black to-[#072029] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t('enterpriseProblem.title', language)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('enterpriseProblem.description', language)}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {pains.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-white mb-3">
                {t(`enterpriseProblem.${item.key}.title`, language)}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t(`enterpriseProblem.${item.key}.description`, language)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseProblem;

