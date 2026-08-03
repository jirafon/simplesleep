import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faPhone, faBuilding, faEnvelope, faComment, faCheckCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const PrivacyPolicyModal = ({ onClose }) => (
  <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-70'>
    <div className='bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full h-[80vh] relative overflow-y-auto'>
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold py-2 text-center">
       Política de Privacidad
      </h2>
      <div className='text-justify space-y-4'>
        <p>
      El acceso a determinados servicios que se ofrecen en el sitio puede requerir el ingreso de datos personales, a saber: dirección de e-mail, nombre, apellido, domicilio completo, tipo y número de documento y otros datos opcionales, o cualquier otra información que permita individualizarlo. En todos los casos que usted brinde información personal, y de acuerdo a la legislación vigente, usted declara que la información brindada es cierta.
    </p>
    <p>
      Los datos que usted ingrese al Sitio se utilizarán para: envío de información de Productos y servicios, reporte de Irregularidades, análisis e investigaciones, Compliance, Asesoramiento legal, aplicaciones de servicios de proceso de negociación y gestión de reclamos previo a la judicialización, sistemas de comunicación internos y externos, obtener estadísticas.
    </p>
    <p>
      El ingreso de datos personales al Sitio por parte de los usuarios es voluntario, sin embargo, Unbiax manifiesta que su ingreso facilitará el uso de los servicios que ofrece y la relación con los usuarios. En los casos en que usted nos brinde su información personal, usted acepta y presta su consentimiento libre, expreso e informado para que dicha información personal sea utilizada en su propio beneficio optimizando la calidad del servicio que le ofrecemos a fin de mantenerlo informado de posibles cambios, y autoriza a que la misma sea tratada, almacenada, recopilada en la base de datos de la compañía.
    </p>
    <p>
      Unbiax garantiza a los usuarios que ingresen sus datos en el Sitio, que los mismos serán encriptados para preservar la seguridad, integridad y confidencialidad de los datos considerados como personales. Unbiax realiza todos los esfuerzos necesarios para evitar su adulteración, pérdida, consulta o tratamiento no autorizado, que permitan detectar desviaciones, intencionales o no, de información, ya sea que los riesgos provengan de la acción humana o del medio técnico utilizado. Para ello, notificamos de nuestras prácticas de privacidad, y las alternativas sobre la manera que su información es recopilada y utilizada.
    </p>
    <p>
      El sistema de encriptado implica que los datos solo podrán ser interpretados por Unbiax y ningún intermediario tendrá acceso a la información.
    </p>
    <p>
      El usuario podrá acceder a sus datos de carácter personal, rectificarlos, cancelarlos u oponerse a su tratamiento, mediante notificación al responsable de la base de datos contacto@unbiax.com (LATAM)
    </p>
    <p>
      Unbiax no cederá esta información con terceros. No obstante, Unbiax podrá enviar a sus usuarios ofertas promocionales o comunicados especiales, donde el usuario siempre tendrá la opción de solicitar dejar de recibirlos.
    </p>
    <p>
      El usuario responderá, en cualquier caso, de la veracidad de los datos facilitados, reservándose Unbiax el derecho de excluir a todo usuario que haya facilitado datos falsos, sin perjuicio de iniciar acciones legales.
    </p>
    <p>
      Unbiax se reserva el derecho de brindar información a organismos de control de cualquier país y/o autoridades judiciales que así lo requieran y cuando medien razones fundadas relativas a la seguridad pública, la defensa nacional o la salud pública.
    </p>
  </div>
  
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200'
        aria-label="Cerrar modal"
      >
        ×
      </button>
    </div>
  </div>
);

const DemoModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    email: '',
    comment: '',
    startup: '',
  });
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isStartupDropdownOpen, setIsStartupDropdownOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const modalRef = useRef(null);

  const módulos  = [
    { id: '', name: 'Selecciona un startup', tagline: '' },
    { id: 'smartrisk', name: 'Smartrisk', tagline: 'Gestión Integral de Riesgos' },
    { id: 'privax', name: 'Privax', tagline: 'Gestión de Privacidad y Cumplimiento' },
    { id: 'insightx', name: 'InsightX', tagline: 'Usa tus datos sensibles y privados en forma segura con IA' },
    { id: 'extrax', name: 'Extrax', tagline: 'Plataforma RAG como Servicio con IA Multilingüe' },
    { id: 'automatix', name: 'Automatix', tagline: 'Automatización de Workflows' },
    { id: 'vizora', name: 'Vizora', tagline: 'Monitoreo de Reputación y Riesgo' },
    { id: 'cyberrisk360', name: 'CyberRisk360', tagline: 'Riesgos de Ciberseguridad' },
    { id: 'eticpro', name: 'Eticpro', tagline: 'Gestión Ética y Cumplimiento' },
  ];

  const handlePrivacyModalOpen = () => {
    setShowPrivacyModal(true);
  };

  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false);
  };

  const handleCheckboxChange = () => {
    setIsPrivacyChecked(!isPrivacyChecked);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleStartupSelect = (startupId) => {
    setFormData({ ...formData, startup: startupId });
    setSelectedStartup(módulos.find(s => s.id === startupId));
    setIsStartupDropdownOpen(false);
  };

  const toggleStartupDropdown = () => {
    setIsStartupDropdownOpen(!isStartupDropdownOpen);
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isStartupDropdownOpen && !event.target.closest('.startup-dropdown')) {
        setIsStartupDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartupDropdownOpen]);

  if (!isOpen && !isSubmitted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { name, phone, company, email, comment, startup } = formData;
    
    // Create email template
    const selectedStartup = módulos.find(s => s.id === startup);
    const emailTemplate = `
      <h2>Nueva Solicitud de Demo - ${selectedStartup ? selectedStartup.name : 'Sin especificar'}</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Empresa:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Startup de interés:</strong> ${selectedStartup ? selectedStartup.name : 'Sin especificar'}</p>
      <p><strong>Comentario:</strong> ${comment || 'Sin comentarios'}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
    `;

    try {
      // Enviar email inmediatamente
      console.log('Enviando email...');
      
      // Enviar email
      const apiBaseUrl = process.env.REACT_APP_BASE_URL || 'https://siempresalud-server.onrender.com';
      const emailResponse = await fetch(`${apiBaseUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: ['contacto@unbiax.com'],
          emailTemplate,
          subject: 'Nueva Solicitud de Demo - Unbiax',
        }),
      });

      // Guardar en MongoDB
      const prospectData = {
        companyName: company,
        rut: "",
        industry: "other",
        size: "medium",
        website: "",
        address: "",
        contacts: [
          {
            name: name,
            role: "Contact",
            email: email,
            phone: phone,
            isPrimary: true
          }
        ],
        stage: "lead",
        source: "Unbiax website",
        estimatedValue: null,
        probability: 10,
        expectedCloseDate: null,
        interestedProducts: selectedStartup ? [selectedStartup.name] : [],
        score: 25,
        priority: "medium",
        nextFollowUp: null,
        status: "active",
        notes: comment || "",
        tags: [],
        assignedTo: "",
         createdBy: "landing@unbiax.com"
      };

  const mongoResponse = await fetch('https://scraperut.onrender.com/crm/prospects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SCRAPER_TOKEN}`
        },
        body: JSON.stringify(prospectData),
      });
      
      console.log('MongoDB Response Status:', mongoResponse.status);
      const mongoResponseText = await mongoResponse.text();
      console.log('MongoDB Response Body:', mongoResponseText);
      
      if (emailResponse.ok && mongoResponse.ok) {
        setFormData({
          name: '',
          phone: '',
          company: '',
          email: '',
          comment: '',
          startup: '',
        });
        setIsSubmitted(true);
      } else {
        console.error('Email response:', emailResponse.status);
        console.error('MongoDB response:', mongoResponse.status);
        alert('Falló el envío del formulario.');
      }
    } catch (error) {
      console.error(error);
      alert('Falló el envío del formulario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showPrivacyModal && <PrivacyPolicyModal onClose={handlePrivacyModalClose} />}
      <div className='fixed inset-0 z-[60] flex items-start justify-center bg-black bg-opacity-60 backdrop-blur-sm pt-16 overflow-y-auto'>
        {isSubmitted ? (
          <div
            ref={modalRef}
            className='bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 my-8 transform transition-all duration-500 scale-100'
          >
            <div className='flex flex-col items-center text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6'>
                <FontAwesomeIcon icon={faCheckCircle} className='text-green-600 text-2xl' />
              </div>
              <h2 className='text-3xl font-bold mb-4 text-gray-800'>¡Enviado!</h2>
              <p className='text-gray-600 mb-8 leading-relaxed'>
                Ya estás más cerca conocer como podemos ayudarte.
                <br /><br />
                <span className='font-semibold text-blue-600'>Un representante te contactará en máximo 48h.</span>
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg'
              >
                ¡Perfecto!
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={modalRef}
            className='bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 my-8 transform transition-all duration-500 scale-100'
            >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2'
            >
              <FontAwesomeIcon icon={faTimes} className='text-xl' />
            </button>
            
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold mb-3 text-gray-800'>Prueba Unbiax</h2>
              <p className='text-gray-600 leading-relaxed'>
              Llena el siguiente formulario y un representante te contactará para resolver tus dudas y activar tu demo sin costo.
            </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Nombre */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className={`text-gray-400 transition-colors duration-200 ${
                      focusedField === 'name' ? 'text-blue-500' : ''
                    }`} 
                  />
                </div>
              <input
                type='text'
                value={formData.name}
                onChange={handleInputChange('name')}
                  onFocus={() => handleFocus('name')}
                  onBlur={handleBlur}
                  placeholder='Nombre completo'
                  className='w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white text-black placeholder-gray-500'
                required
              />
              </div>

              {/* Teléfono */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faPhone} 
                    className={`text-gray-400 transition-colors duration-200 ${
                      focusedField === 'phone' ? 'text-blue-500' : ''
                    }`} 
                  />
                </div>
              <input
                  type='tel'
                value={formData.phone}
                onChange={handleInputChange('phone')}
                  onFocus={() => handleFocus('phone')}
                  onBlur={handleBlur}
                placeholder='Teléfono'
                  className='w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white text-black placeholder-gray-500'
                required
              />
              </div>

              {/* Organización */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faBuilding} 
                    className={`text-gray-400 transition-colors duration-200 ${
                      focusedField === 'company' ? 'text-blue-500' : ''
                    }`} 
                  />
                </div>
              <input
                type='text'
                value={formData.company}
                onChange={handleInputChange('company')}
                  onFocus={() => handleFocus('company')}
                  onBlur={handleBlur}
                  placeholder='Organización'
                  className='w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white text-black placeholder-gray-500'
                required
              />
              </div>

              {/* Startup de interés */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faBuilding} 
                    className='text-gray-400'
                  />
                </div>
                <button
                  type='button'
                  onClick={toggleStartupDropdown}
                  className='w-full pl-10 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white text-left text-black'
                >
                  <span className={formData.startup ? 'text-black' : 'text-gray-500'}>
                    {formData.startup ? módulos.find(s => s.id === formData.startup)?.name : 'Selecciona un startup de interés'}
                  </span>
                </button>
                <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`text-gray-400 transition-transform duration-200 ${isStartupDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {/* Dropdown */}
                {isStartupDropdownOpen && (
                  <div className='startup-dropdown absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto'>
                    {módulos.map((startup) => (
                      <button
                        key={startup.id}
                        type='button'
                        onClick={() => handleStartupSelect(startup.id)}
                        className='w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                      >
                        <div className='font-medium text-gray-900'>{startup.name}</div>
                        {startup.tagline && (
                          <div className='text-sm text-gray-500 mt-1'>{startup.tagline}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className={`text-gray-400 transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-blue-500' : ''
                    }`} 
                  />
                </div>
              <input
                type='email'
                value={formData.email}
                onChange={handleInputChange('email')}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  placeholder='Email corporativo'
                  className='w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white text-black placeholder-gray-500'
                required
              />
              </div>

              {/* Comentario */}
              <div className='relative'>
                <div className='absolute top-4 left-3 flex items-center pointer-events-none'>
                  <FontAwesomeIcon 
                    icon={faComment} 
                    className={`text-gray-400 transition-colors duration-200 ${
                      focusedField === 'comment' ? 'text-blue-500' : ''
                    }`} 
                  />
                </div>
              <textarea
                value={formData.comment}
                onChange={handleInputChange('comment')}
                  onFocus={() => handleFocus('comment')}
                  onBlur={handleBlur}
                  placeholder='¿En qué podemos ayudarte? (opcional)'
                  rows={4}
                  className='w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-black placeholder-gray-500'
                />
              </div>

              {/* Checkbox */}
              <div className='flex items-start space-x-3'>
                <input
                  type='checkbox'
                  id='privacy-checkbox'
                  checked={isPrivacyChecked}
                  onChange={handleCheckboxChange}
                  className='mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  required
                />
                <label htmlFor='privacy-checkbox' className='text-sm text-gray-600 leading-relaxed'>
                  Acepto la{' '}
                  <button
                    type='button'
                    onClick={handlePrivacyModalOpen}
                    className='text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200'
                  >
                    política de privacidad
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={!isPrivacyChecked || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  isPrivacyChecked && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    Enviando... 
                  </div>
                ) : (
                  t('demo.title', language)
                )}
              </button>
            </form>

          </div>
        )}
      </div>
    </>
  );
};

export default DemoModal;
