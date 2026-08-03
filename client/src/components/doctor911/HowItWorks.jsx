import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileMedical, FaCreditCard, FaDownload } from 'react-icons/fa';

function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: <FaFileMedical className="text-3xl text-blue-600" />,
      title: 'Elige tu orden médica',
      description: 'Selecciona entre orden preventiva o personalizada según tus necesidades.',
      color: 'blue'
    },
    {
      number: '2',
      icon: <FaCreditCard className="text-3xl text-green-600" />,
      title: 'Realiza el pago',
      description: 'Pago seguro y rápido. Recibe tu orden médica inmediatamente después.',
      color: 'green'
    },
    {
      number: '3',
      icon: <FaDownload className="text-3xl text-purple-600" />,
      title: 'Descarga y usa',
      description: 'Descarga tu orden en PDF y preséntala en cualquier laboratorio o clínica.',
      color: 'purple'
    }
  ];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tres pasos simples para obtener tu orden médica
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all"
            >
              {/* Step Number */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                  step.color === 'blue' ? 'bg-blue-600' :
                  step.color === 'green' ? 'bg-green-600' :
                  'bg-purple-600'
                }`}>
                  {step.number}
                </div>
                <div className="flex-1">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/orden-preventiva"
            className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition"
          >
            Solicitar Orden Médica
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
