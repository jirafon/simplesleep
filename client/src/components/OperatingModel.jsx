import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const OperatingModel = () => {
  const { language } = useLanguage();

  const steps = [
    { key: 'step1' },
    { key: 'step2' },
    { key: 'step3' },
    { key: 'step4' }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#072029] to-black overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t('operatingModel.title', language)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
            {t('operatingModel.description', language)}
          </p>
          <p className="text-lg text-blue-400 font-semibold">
            {t('operatingModel.timeline', language)}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 relative"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 mt-2">
                {t(`operatingModel.${item.key}.title`, language)}
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {t(`operatingModel.${item.key}.description`, language)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperatingModel;

