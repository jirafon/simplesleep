import React from "react";
import { motion } from "framer-motion";
import AiPeerChat from "./AiPeerChat";
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const AiPeerPage = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  return (
    <div className="relative bg-gradient-to-b from-black via-[#09184a] to-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px), linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              {t('aiPeer.badge', language)}
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 mb-6">
              {t('aiPeer.title', language)} <span className="text-cyan-400">{t('aiPeer.titleHighlight', language)}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              {t('aiPeer.subtitle', language)}
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              {t('aiPeer.description', language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onOpenDemo}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {t('aiPeer.tryDemo', language)}
              </button>
              <button 
                onClick={onOpenDemo}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {t('aiPeer.schedulePresentation', language)}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(t('aiPeer.benefits', language) || []).map((benefit, index) => {
              const icons = ["🔒", "🧩", "⚙️"];
              const borderColors = ["hover:border-cyan-500/50", "hover:border-blue-500/50", "hover:border-green-500/50"];
              const shadowColors = ["hover:shadow-cyan-500/10", "hover:shadow-blue-500/10", "hover:shadow-green-500/10"];
              return (
            <motion.div
                  key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 ${borderColors[index]} transition-all duration-300 hover:shadow-xl ${shadowColors[index]}`}
            >
                  <div className="text-4xl mb-4">{icons[index]}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-gray-400">
                    {benefit.description}
              </p>
            </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chat Demo Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 mb-4"
          >
            {t('aiPeer.chatTitle', language)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            {t('aiPeer.chatDescription', language)}
          </motion.p>
        </div>
        <AiPeerChat />
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              {t('aiPeer.ctaTitle', language)}
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              {t('aiPeer.ctaDescription', language)}
            </p>
            <button 
              onClick={onOpenDemo}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {t('aiPeer.requestDemo', language)}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AiPeerPage;
