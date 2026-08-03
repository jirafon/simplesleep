import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const módulos  = [
  { name: 'Privax' },
  { name: 'Automatix - Ai Peer' },
  { name: 'Smartrisk' }
];

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black bg-opacity-70 backdrop-blur-sm pt-16 overflow-y-auto">
      <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">Política de Privacidad</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="space-y-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
          <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">1. Información que Recopilamos</h3>
          <p>Recopilamos información que usted nos proporciona directamente, como cuando:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Completa formularios en nuestro sitio web</li>
            <li>Se registra para recibir información o demos</li>
            <li>Se comunica con nosotros por email o teléfono</li>
            <li>Participa en encuestas o evaluaciones</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">2. Uso de la Información</h3>
          <p>Utilizamos la información recopilada para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Comunicarnos con usted sobre productos y servicios</li>
            <li>Enviar información técnica y de soporte</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
            <li>Analizar el uso de nuestros servicios</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">3. Compartir Información</h3>
          <p>No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Con su consentimiento explícito</li>
            <li>Para cumplir con obligaciones legales</li>
            <li>Con proveedores de servicios que nos ayudan a operar</li>
            <li>En caso de fusión o adquisición empresarial</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">4. Seguridad de Datos</h3>
          <p>Implementamos medidas de seguridad técnicas y organizacionales apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">5. Sus Derechos</h3>
          <p>Usted tiene derecho a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder a su información personal</li>
            <li>Corregir información inexacta</li>
            <li>Solicitar la eliminación de sus datos</li>
            <li>Oponerse al procesamiento de sus datos</li>
            <li>Retirar su consentimiento en cualquier momento</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">6. Contacto</h3>
          <p>Para ejercer sus derechos o hacer preguntas sobre esta política, contáctenos en: <a href="mailto:contacto@unbiax.com" className="text-blue-600 hover:underline">contacto@unbiax.com</a></p>
      </div>
        
        
    </div>
  </div>
);
};

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black bg-opacity-70 backdrop-blur-sm pt-16 overflow-y-auto">
      <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">Términos y Condiciones</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="space-y-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
          <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">1. Aceptación de los Términos</h3>
          <p>Al acceder y utilizar los servicios de Unbiax Solutions, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">2. Descripción de Servicios</h3>
          <p>Unbiax Solutions proporciona soluciones de software para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gestión de riesgos y compliance</li>
            <li>Protección de datos personales</li>
            <li>Validación ética de IA</li>
            <li>Encuestas y análisis de opinión</li>
            <li>Automatización de workflows</li>
            <li>Monitoreo de reputación y regulación</li>
            <li>Gestión de ciberseguridad</li>
            <li>Cumplimiento ético empresarial</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">3. Uso Aceptable</h3>
          <p>Usted se compromete a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usar nuestros servicios solo para fines legítimos</li>
            <li>No intentar acceder no autorizado a nuestros sistemas</li>
            <li>No interferir con el funcionamiento de nuestros servicios</li>
            <li>Proporcionar información precisa y actualizada</li>
            <li>Cumplir con todas las leyes aplicables</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">4. Propiedad Intelectual</h3>
          <p>Todos los derechos de propiedad intelectual relacionados con nuestros servicios, incluyendo pero no limitado a software, diseño, contenido y marcas comerciales, son propiedad de Unbiax Solutions o sus licenciantes.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">5. Limitación de Responsabilidad</h3>
          <p>En la máxima medida permitida por la ley, Unbiax Solutions no será responsable por daños indirectos, incidentales, especiales o consecuentes que surjan del uso de nuestros servicios.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">6. Modificaciones</h3>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">7. Ley Aplicable</h3>
          <p>Estos términos se rigen por las leyes de Chile. Cualquier disputa será resuelta en los tribunales competentes de Santiago, Chile.</p>
          
          <h3 className="text-xl font-semibold text-blue-800 mt-6">8. Contacto</h3>
          <p>Para preguntas sobre estos términos, contáctenos en: <a href="mailto:contacto@unbiax.com" className="text-blue-600 hover:underline">contacto@unbiax.com</a></p>
      </div>
        
        
      </div>
    </div>
  );
};

const Footer = () => {
  const { language } = useLanguage();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer id="footer" className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-14 px-4 mt-16 shadow-inner scroll-mt-24 md:scroll-mt-28">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-start">
            <p className="mb-2 font-bold text-2xl tracking-tight">Unbiax Solutions</p>
            <p className="text-sm mb-4 opacity-80">{t('footer.description', language)}</p>
            <div className="flex flex-col space-y-2 mt-2 text-lg">
              <a href="mailto:contacto@unbiax.com" className="hover:underline flex items-center gap-1"><span>📧</span>contacto@unbiax.com</a>
              <a href="tel:+56987375517" className="hover:underline flex items-center gap-1"><span>📞</span>+56 9 8737 5517</a>
              <a href="https://www.linkedin.com/company/unbiax" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1"><span>🔗</span>LinkedIn</a>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <p className="font-bold mb-2 text-lg">{t('footer.modules', language)}</p>
            <ul className="space-y-1">
              {módulos.map((s, i) => (
                <li key={i}>
                  {s.link ? (
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="hover:underline transition-all duration-200 hover:text-blue-200">{s.name}</a>
                  ) : (
                    <span>{s.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start">
            <p className="font-bold mb-2 text-lg">{t('footer.legal', language)}</p>
            <button onClick={() => setShowPrivacy(true)} className="hover:underline text-sm mb-1 transition-all duration-200 hover:text-blue-200 text-left">{t('footer.privacyPolicy', language)}</button>
            <button onClick={() => setShowTerms(true)} className="hover:underline text-sm mb-1 transition-all duration-200 hover:text-blue-200 text-left">{t('footer.termsConditions', language)}</button>
            <p className="text-xs mt-8 opacity-70">&copy; {new Date().getFullYear()} Unbiax Solutions. {t('footer.copyright', language)}</p>
          </div>
        </div>
        
        {/* Institutional tagline */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-blue-700/30">
          <p className="text-center text-blue-200 font-semibold text-lg">
            {t('footer.tagline', language)}
          </p>
        </div>
      </footer>
      
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
};

export default Footer;



