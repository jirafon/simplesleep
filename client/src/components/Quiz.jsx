import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Check from '../assets/check@2x.png'; // Asegúrate de que esta ruta sea correcta
import QuizModal from './QuizModal'; // Import the new QuizModal component


const PrivacyPolicyModal = ({ onClose }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'>
    <div className='bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full h-[80vh] relative overflow-y-auto'> {/* Modal más ancha y desplazable */}
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    email: '',
    comment: '',
  });
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [percentage, setPercentage] = useState(0);

  const handlePrivacyModalOpen = () => {
    setShowPrivacyModal(true);
  };

  
  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false);
  };

  const handleCheckboxChange = () => {
    setIsPrivacyChecked(!isPrivacyChecked);
  };

  if (!isOpen && !isSubmitted) return null;

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPrivacyChecked) {
      setIsSubmitted(true);
      setShowQuizModal(true);
    } else {
      alert('Debes aceptar la política de privacidad.');
    }
  };


  const handleQuizComplete = (percentage) => {
    setPercentage(percentage);
    setShowQuizModal(false);
    onClose(); // Close the DemoModal as well
  };

  return (
    <>
      {showPrivacyModal && <PrivacyPolicyModal onClose={handlePrivacyModalClose} />}
      {showQuizModal && 
      <QuizModal 
      isOpen={showQuizModal} 
      onClose={() => setShowQuizModal(false)}
      onComplete={handleQuizComplete} 
      formData={formData}  // Pasa los datos correctos

       />}
      
      <div className='fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50'>
        {isSubmitted ? (
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative'>
            <div className='flex flex-col items-center'>
              <img src={Check} alt="Check Icon" className='w-12 h-12 mb-4' />
              <h2 className='text-3xl font-bold mb-6 text-center'>¡Enviado!</h2>
              <p className='text-base md:text-lg mb-6 text-center'>
              Ya estás más cerca de conocer como Unbiax te puede ayudar.
              Un representante te contactará en máximo 48h.
                <br />
                Su resultado  es : {percentage}%              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className='bg-[rgb(43,71,146)] text-white p-2 rounded-md w-full'
              >
                Ok
              </button>
            </div>
          </div>
        ) : (
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative'>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200'
              aria-label='Cerrar modal'
            >
              ×
            </button>
            <h2 className='text-3xl font-bold mb-6 text-center'>Diagnóstico de compliance</h2>
            <p className='text-2xl md:text-lg mb-6 text-center'>
              Responde a las siguientes preguntas y conoce qué tan preparado estás para cumplir con la Ley.
            </p>
            <form onSubmit={handleSubmit}>
            <input
                type='email'
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder='Email'
                className='block w-full max-w-xs mt-1 border border-gray-300 rounded-md px-4 py-1 mb-6'
                required
              />
              <input
                type='text'
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder='Nombre'
                className='block w-full max-w-xs mt-1 border border-gray-300 rounded-md px-4 py-1 mb-6'
                required
              />
              <input
                type='text'
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder='Teléfono'
                className='block w-full max-w-xs mt-1 border border-gray-300 rounded-md px-4 py-1 mb-6'
                required
              />
              <input
                type='text'
                value={formData.company}
                onChange={handleInputChange('company')}
                placeholder='organización'
                className='block w-full max-w-xs mt-1 border border-gray-300 rounded-md px-4 py-1 mb-6'
                required
              />
         
              <textarea
                value={formData.comment}
                onChange={handleInputChange('comment')}
                placeholder='Comentario'
                className='block w-full max-w-xs mt-1 border border-gray-300 rounded-md px-4 py-1 mb-6'
              />
              <div className='flex items-center mb-6'>
                <input
                  type='checkbox'
                  id='privacy-checkbox'
                  checked={isPrivacyChecked}
                  onChange={handleCheckboxChange}
                  className='mr-2'
                  required
                />
                <label htmlFor='privacy-checkbox' className='text-sm'>
                  Acepto la{' '}
                  <button
                    type='button'
                    onClick={handlePrivacyModalOpen}
                    className='text-blue-600 underline bg-white border border-blue-600 p-2 rounded-md'
                  >
                    política de privacidad
                  </button>
                </label>
              </div>
              <button
                type='submit'
                className='bg-[rgb(43,71,146)] text-white p-2 rounded-md w-full'
                disabled={!isPrivacyChecked}
              >
                Comenzar Quiz
              </button>
            </form>
            
            
          </div>
        )}
      </div>
    </>
  );
};

export default DemoModal;