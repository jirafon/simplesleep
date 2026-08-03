import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const HealthcarePage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  const challenges = t('healthcarePage.challenges.items', language) || [];
  const useCases = t('healthcarePage.useCases.items', language) || [];
  const governanceItems = t('healthcarePage.governance.items', language) || [];
  const outcomes = t('healthcarePage.outcomes.items', language) || [];

  return (
    <main className="pt-8">
      {/* Industry Introduction */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#072029] via-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {t('healthcarePage.title', language)}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('healthcarePage.intro', language)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Common Challenges */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
              {t('healthcarePage.challenges.title', language)}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {challenge.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We Support */}
      <section className="py-16 bg-gradient-to-b from-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
              {t('healthcarePage.support.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
              {t('healthcarePage.support.description', language)}
            </p>
            <div className="bg-white/5 border border-blue-500/30 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🔗</div>
                  <p className="text-white font-semibold mb-2">{t('healthcarePage.support.point1.title', language)}</p>
                  <p className="text-gray-400 text-sm">{t('healthcarePage.support.point1.description', language)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🧠</div>
                  <p className="text-white font-semibold mb-2">{t('healthcarePage.support.point2.title', language)}</p>
                  <p className="text-gray-400 text-sm">{t('healthcarePage.support.point2.description', language)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🚫</div>
                  <p className="text-white font-semibold mb-2">{t('healthcarePage.support.point3.title', language)}</p>
                  <p className="text-gray-400 text-sm">{t('healthcarePage.support.point3.description', language)}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <p className="text-lg text-blue-400 font-semibold text-center">
                  {t('healthcarePage.support.tagline', language)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
              {t('healthcarePage.useCases.title', language)}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy, Safety and Governance */}
      <section className="py-16 bg-gradient-to-b from-[#072029] to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
              {t('healthcarePage.governance.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
              {t('healthcarePage.governance.description', language)}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {governanceItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">
              {t('healthcarePage.outcomes.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
              {t('healthcarePage.outcomes.description', language)}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outcomes.map((outcome, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {outcome.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {outcome.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-black to-[#072029]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('healthcarePage.ctaTitle', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              {t('healthcarePage.ctaDescription', language)}
            </p>
            <button
              onClick={onOpenDemo}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg shadow-blue-500/50"
            >
              {t('healthcarePage.ctaButton', language)}
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default HealthcarePage;

