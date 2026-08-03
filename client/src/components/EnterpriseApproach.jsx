import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const EnterpriseApproach = () => {
  const { language } = useLanguage();

  const principles = [
    { key: 'principle1' },
    { key: 'principle2' },
    { key: 'principle3' },
    { key: 'principle4' }
  ];

  return (
    <section className="relative py-24 bg-[#072029] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t('enterpriseApproach.title', language)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('enterpriseApproach.description', language)}
          </p>
          <p className="text-lg text-blue-400 font-semibold max-w-2xl mx-auto">
            {t('enterpriseApproach.tagline', language)}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {principles.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-blue-500/30 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {t(`enterpriseApproach.${item.key}.title`, language)}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t(`enterpriseApproach.${item.key}.description`, language)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseApproach;

