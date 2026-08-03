import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
 
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import SmartriskLogo from '../assets/smartrisklogo.png';
import PrivaxLogo from '../assets/privaxlow.png';
import AutomatixLogo from '../assets/automat.png';

const ModulesSection = () => {
  const { language } = useLanguage();

  const modules = [
    {
      key: "smartrisk",
      path: "/smartrisk",
      logo: SmartriskLogo,
      color: "from-red-500 to-orange-500",
      borderColor: "border-red-500/30"
    },
    {
      key: "privax",
      path: "/privax",
      logo: PrivaxLogo,
      color: "from-green-500 to-emerald-500",
      borderColor: "border-green-500/30"
    },
    {
      key: "aipeer",
      path: "/automatix",
      logo: AutomatixLogo,
      color: "from-cyan-500 to-blue-500",
      borderColor: "border-cyan-500/30"
    }
  ];

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
            <span className="text-blue-300 text-sm font-semibold">{t('modules.badge', language)}</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('modules.title', language)}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {t('modules.titleHighlight', language)}
            </span>
          </h2>
        </motion.div>

        {/* Modules grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link
              key={index}
              to={module.path}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border ${module.borderColor} rounded-2xl p-8 hover:border-opacity-60 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl cursor-pointer`}
              >
                {/* Logo */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${module.color} mb-6 p-2 group-hover:scale-110 transition-transform duration-300`}>
                  {module.logo ? (
                    <img 
                      src={module.logo} 
                      alt={t(`modules.${module.key}.name`, language)} 
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {/* Module name */}
                <h3 className="text-2xl font-black text-white mb-2">
                  {t(`modules.${module.key}.name`, language)}
                </h3>

                {/* Purpose */}
                <p className={`text-sm font-semibold bg-gradient-to-r ${module.color} bg-clip-text text-transparent mb-4`}>
                  {t(`modules.${module.key}.purpose`, language)}
                </p>

                {/* Value proposition */}
                <p className="text-gray-300 leading-relaxed">
                  {t(`modules.${module.key}.value`, language)}
                </p>
              </motion.div>
            </Link>
          ))}

          
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
