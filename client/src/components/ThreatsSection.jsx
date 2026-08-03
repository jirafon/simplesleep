import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { t, translations } from '../translations';

const ThreatsSection = () => {
  const { language } = useLanguage();

  const threats = [
    {
      rank: 1,
      percentage: 12.9,
      icon: "🔐",
      color: "red"
    },
    {
      rank: 2,
      percentage: 9.8,
      icon: "⚠️",
      color: "orange"
    },
    {
      rank: 3,
      percentage: 9.8,
      icon: "⚖️",
      color: "yellow"
    },
    {
      rank: 4,
      percentage: 8.3,
      icon: "🌍",
      color: "green"
    },
    {
      rank: 5,
      percentage: 8.3,
      icon: "💰",
      color: "purple"
    },
    {
      rank: 6,
      percentage: 7.7,
      icon: "😞",
      color: "blue"
    },
    {
      rank: 7,
      percentage: 6.5,
      icon: "🏥",
      color: "pink"
    },
    {
      rank: 8,
      percentage: 5.8,
      icon: "🤝",
      color: "indigo"
    }
  ];

  const getBarWidth = (percentage) => {
    const maxPercentage = 12.9;
    return (percentage / maxPercentage) * 100;
  };

  const getColorClasses = (color) => {
    const colors = {
      red: { 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/30', 
        text: 'text-red-400', 
        bar: 'bg-gradient-to-r from-red-500 to-red-600',
        glow: 'shadow-red-500/20'
      },
      orange: { 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500/30', 
        text: 'text-orange-400', 
        bar: 'bg-gradient-to-r from-orange-500 to-orange-600',
        glow: 'shadow-orange-500/20'
      },
      yellow: { 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/30', 
        text: 'text-yellow-400', 
        bar: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        glow: 'shadow-yellow-500/20'
      },
      green: { 
        bg: 'bg-green-500/10', 
        border: 'border-green-500/30', 
        text: 'text-green-400', 
        bar: 'bg-gradient-to-r from-green-500 to-green-600',
        glow: 'shadow-green-500/20'
      },
      purple: { 
        bg: 'bg-purple-500/10', 
        border: 'border-purple-500/30', 
        text: 'text-purple-400', 
        bar: 'bg-gradient-to-r from-purple-500 to-purple-600',
        glow: 'shadow-purple-500/20'
      },
      blue: { 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/30', 
        text: 'text-blue-400', 
        bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
        glow: 'shadow-blue-500/20'
      },
      pink: { 
        bg: 'bg-pink-500/10', 
        border: 'border-pink-500/30', 
        text: 'text-pink-400', 
        bar: 'bg-gradient-to-r from-pink-500 to-pink-600',
        glow: 'shadow-pink-500/20'
      },
      indigo: { 
        bg: 'bg-indigo-500/10', 
        border: 'border-indigo-500/30', 
        text: 'text-indigo-400', 
        bar: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
        glow: 'shadow-indigo-500/20'
      }
    };
    return colors[color];
  };

  return (
    <section className="relative py-16 bg-gradient-to-b from-black via-[#09184a] to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px), linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            {t('threats.badge', language)}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-red-300 mb-4">
            {t('threats.title', language)}
          </h2>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            {t('threats.subtitle', language)}<br />
            <span className="text-blue-400 font-semibold">{t('threats.subtitleHighlight', language)}</span>
          </p>
        </motion.div>

        {/* Threats Table/Chart */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-10">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 pb-3 mb-4 border-b border-gray-700/50">
            <div className="col-span-1 text-gray-500 text-xs font-semibold">{t('threats.tableHeaders.rank', language)}</div>
            <div className="col-span-4 text-gray-500 text-xs font-semibold">{t('threats.tableHeaders.threat', language)}</div>
            <div className="col-span-3 text-gray-500 text-xs font-semibold">{t('threats.tableHeaders.percentage', language)}</div>
            <div className="col-span-2 text-gray-500 text-xs font-semibold">{t('threats.tableHeaders.impact', language)}</div>
            <div className="col-span-2 text-gray-500 text-xs font-semibold">{t('threats.tableHeaders.solution', language)}</div>
          </div>

          {/* Threats Rows */}
          <div className="space-y-3">
            {threats.map((threat, index) => {
              const colors = getColorClasses(threat.color);
              const threatData = translations[language].threats.threats[index];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`group grid grid-cols-12 gap-3 items-center p-3 rounded-lg border ${colors.border} ${colors.bg} hover:bg-white/5 transition-all duration-300 hover:shadow-lg ${colors.glow}`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <div className={`w-6 h-6 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text} font-bold text-xs`}>
                      {threat.rank}
                    </div>
                  </div>

                  {/* Threat Title */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{threat.icon}</span>
                      <span className="text-white font-semibold text-xs leading-tight">
                        {threatData.title}
                      </span>
                    </div>
                  </div>

                  {/* Percentage Bar */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800/50 rounded-full h-5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${getBarWidth(threat.percentage)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          className={`h-full ${colors.bar} flex items-center justify-end pr-1.5`}
                        >
                          <span className="text-[10px] font-bold text-white drop-shadow-lg">
                            {threat.percentage}%
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${colors.bg} ${colors.border} border ${colors.text} text-[10px] font-semibold`}>
                      {threatData.impact}
                    </span>
                  </div>

                  {/* Module */}
                  <div className="col-span-2">
                    <span className="text-blue-400 text-[10px] font-bold">
                      {threatData.module}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-1">
                {t('threats.stats.stat1.value', language)}
              </div>
              <div className="text-gray-400 text-xs">
                {t('threats.stats.stat1.description', language)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-1">
                {t('threats.stats.stat2.value', language)}
              </div>
              <div className="text-gray-400 text-xs">
                {t('threats.stats.stat2.description', language)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-1">
                {t('threats.stats.stat3.value', language)}
              </div>
              <div className="text-gray-400 text-xs">
                {t('threats.stats.stat3.description', language)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThreatsSection;
