import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const features = [
  { icon: '🛡️', title: 'security', text: 'securityDesc' },
  { icon: '👤', title: 'users', text: 'usersDesc' },
  { icon: '🤖', title: 'ai', text: 'aiDesc' },
  { icon: '📊', title: 'compliance', text: 'complianceDesc' },
];

// Removed diagram; spinoffs array no longer needed

const ArchitectureHighlight = () => {
  const { language } = useLanguage();
  
  return (
  <section id="arquitectura" className="w-full flex justify-center py-20 px-4 bg-black relative overflow-hidden scroll-mt-24 md:scroll-mt-28 mt-16 md:mt-24">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black"></div>
    
    <div 
      className="bg-gray-800/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 max-w-5xl w-full p-12 flex flex-col items-center relative"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl"></div>
      
      <div className="relative z-10 w-full">
        <h2 
          className="text-4xl md:text-5xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          {t('architecture.title', language)}
        </h2>
        
        <div 
          className="w-full max-w-2xl mx-auto text-lg text-gray-300 space-y-6 mb-12"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {features.map((f, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-gray-700/30 backdrop-blur-sm border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 group"
              data-aos="fade-left"
              data-aos-delay={500 + i * 100}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{f.icon}</span>
              <div>
                <div className="text-xl font-bold group-hover:text-white transition-colors duration-300">
                  {t(`architecture.features.${f.title}`, language)}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {t(`architecture.features.${f.text}`, language)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        
        
        <p 
          className="text-center text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          data-aos="fade-up"
          data-aos-delay="800"
        >
          {t('architecture.callToAction', language)}
        </p>
      </div>
    </div>
  </section>
  );
};

export default ArchitectureHighlight; 