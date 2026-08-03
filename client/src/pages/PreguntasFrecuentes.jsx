import React, { useState } from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function PreguntasFrecuentes() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: '¿Cómo funciona el registro?',
      answer: 'El registro es rápido y simple, toma solo 2 minutos. Solo necesitas proporcionar tu nombre, email y crear una contraseña. Una vez registrado, tendrás acceso inmediato a todos nuestros servicios.'
    },
    {
      question: '¿Qué tipos de exámenes puedo solicitar?',
      answer: 'Ofrecemos órdenes médicas para exámenes preventivos como PAP, tiroides, hipertensión, mamografía, y también puedes solicitar órdenes personalizadas según tus necesidades.'
    },

    {
      question: '¿Qué es la bitácora personal?',
      answer: 'La bitácora personal es tu historial médico completo en la plataforma. Aquí puedes ver todas tus órdenes médicas, citas de telemedicina, resultados y documentos relacionados con tu salud.'
    },
    {
      question: '¿Los servicios están disponibles en áreas rurales?',
      answer: 'Sí, uno de nuestros objetivos principales es brindar acceso a servicios médicos en áreas rurales. Nuestra plataforma está disponible 24/7 con cobertura nacional, permitiendo que personas en zonas remotas accedan a servicios médicos de calidad.'
    },
    {
      question: '¿Cómo se procesan los pagos?',
      answer: 'Utilizamos pasarelas de pago seguras para procesar todas las transacciones. Tu información de pago está encriptada y protegida. Aceptamos diversos métodos de pago para tu conveniencia.'
    },
  
    {
      question: '¿Mis datos médicos están seguros?',
      answer: 'Absolutamente. Implementamos medidas de seguridad de nivel médico para proteger tu información. Utilizamos encriptación, controles de acceso estrictos y cumplimos con todas las regulaciones de protección de datos de salud aplicables.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <FaChevronUp className="text-blue-600 flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿No encontraste tu respuesta?
          </h2>
          <p className="text-gray-700 mb-6">
            Estamos aquí para ayudarte. Contáctanos y responderemos todas tus preguntas.
          </p>
          <a
            href="/contacto"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Contactar
          </a>
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default PreguntasFrecuentes;
