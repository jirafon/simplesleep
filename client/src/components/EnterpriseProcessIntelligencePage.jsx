import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const EnterpriseProcessIntelligencePage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  const problems = [
    { key: 'problem1' },
    { key: 'problem2' },
    { key: 'problem3' },
    { key: 'problem4' },
    { key: 'problem5' },
    { key: 'problem6' }
  ];

  const deliverables = [
    { key: 'deliverable1' },
    { key: 'deliverable2' },
    { key: 'deliverable3' },
    { key: 'deliverable4' },
    { key: 'deliverable5' }
  ];

  const phases = [
    { key: 'phase1' },
    { key: 'phase2' },
    { key: 'phase3' },
    { key: 'phase4' }
  ];

  const governancePoints = [
    { key: 'point1' },
    { key: 'point2' },
    { key: 'point3' }
  ];

  const differentiators = [
    { key: 'diff1' },
    { key: 'diff2' },
    { key: 'diff3' }
  ];

  const results = [
    { key: 'result1' },
    { key: 'result2' },
    { key: 'result3' },
    { key: 'result4' },
    { key: 'result5' }
  ];

  return (
    <main className="pt-8">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#072029] via-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {t('epiService.headline', language)}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('epiService.subheadline', language)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.whoFor.title', language)}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('epiService.whoFor.description1', language)}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('epiService.whoFor.description2', language)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problems We Address */}
      <section className="py-16 bg-gradient-to-b from-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
              {t('epiService.problems.title', language)}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t(`epiService.problems.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.problems.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.approach.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('epiService.approach.description', language)}
            </p>
            <div className="bg-white/5 border border-blue-500/30 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🚫</div>
                  <p className="text-white font-semibold mb-2">{t('epiService.approach.no1', language)}</p>
                  <p className="text-gray-400 text-sm">{t('epiService.approach.no1Desc', language)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🚫</div>
                  <p className="text-white font-semibold mb-2">{t('epiService.approach.no2', language)}</p>
                  <p className="text-gray-400 text-sm">{t('epiService.approach.no2Desc', language)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🚫</div>
                  <p className="text-white font-semibold mb-2">{t('epiService.approach.no3', language)}</p>
                  <p className="text-gray-400 text-sm">{t('epiService.approach.no3Desc', language)}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <p className="text-lg text-blue-400 font-semibold text-center">
                  {t('epiService.approach.tagline', language)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Deliver */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.deliverables.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('epiService.deliverables.description', language)}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliverables.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t(`epiService.deliverables.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.deliverables.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-black to-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.howItWorks.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              {t('epiService.howItWorks.description', language)}
            </p>
            <p className="text-lg text-blue-400 font-semibold mb-8">
              {t('epiService.howItWorks.timeline', language)}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {phases.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 relative"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 mt-2">
                    {t(`epiService.howItWorks.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.howItWorks.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Governance, Security and Compliance */}
      <section className="py-16 bg-[#072029]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.governance.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('epiService.governance.description', language)}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {governancePoints.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t(`epiService.governance.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.governance.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.different.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('epiService.different.description', language)}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {differentiators.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t(`epiService.different.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.different.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Typical Results */}
      <section className="py-16 bg-gradient-to-b from-[#072029] to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.results.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t('epiService.results.description', language)}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t(`epiService.results.${item.key}.title`, language)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`epiService.results.${item.key}.description`, language)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('epiService.cta.title', language)}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              {t('epiService.cta.description', language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onOpenDemo}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg shadow-blue-500/50"
              >
                {t('epiService.cta.button', language)}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              {t('epiService.cta.footer', language)}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default EnterpriseProcessIntelligencePage;

