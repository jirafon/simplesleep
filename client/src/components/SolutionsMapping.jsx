import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const SolutionsMapping = ({ onOpenDemo }) => {
  const { language } = useLanguage();
  
  const icons = ["🔐", "⚠️", "⚖️", "🌍", "💰"];
  const colors = [
    "from-red-500 to-red-700",
    "from-blue-500 to-blue-700",
    "from-orange-500 to-orange-700",
    "from-green-500 to-green-700",
    "from-yellow-500 to-yellow-700"
  ];
  
  const solutions = (t('solutionsMapping.solutions', language) || []).map((sol, index) => ({
    ...sol,
    icon: icons[index],
    color: colors[index]
  }));

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-[#131369] to-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgb(59, 130, 246) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {t('solutionsMapping.badge', language)}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 mb-6">
            {t('solutionsMapping.title', language)}<br />{t('solutionsMapping.titleHighlight', language)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('solutionsMapping.description', language)}<br />
            <span className="text-blue-400 font-semibold">{t('solutionsMapping.descriptionHighlight', language)}</span>
          </p>
        </motion.div>

        {/* Solutions Table/Cards */}
        <div className="space-y-6 mb-12">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Threat column */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {solution.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {solution.threat}
                      </h3>
                      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${solution.color}`}></div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:block lg:col-span-1 text-center">
                  <svg className="w-8 h-8 text-blue-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Modules column */}
                <div className="lg:col-span-3">
                  <div className="flex flex-wrap gap-2">
                    {solution.modules.map((module, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${solution.color} px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-lg`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description column */}
                <div className="lg:col-span-5">
                  <p className="text-gray-300 mb-3">
                    {solution.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {solution.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-400"
                      >
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center relative overflow-hidden group"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              {t('solutionsMapping.ctaTitle', language)}
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              {t('solutionsMapping.ctaDescription', language)}
            </p>
            <button
              onClick={onOpenDemo}
              className="group/btn bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="flex items-center gap-3 justify-center">
                {t('solutionsMapping.ctaButton', language)}
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionsMapping;
