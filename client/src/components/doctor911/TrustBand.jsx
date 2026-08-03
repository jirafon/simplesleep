import React from 'react';
import { FaStethoscope, FaShieldAlt, FaRegClock, FaHospital } from 'react-icons/fa';

function TrustBand() {
  const items = [
    {
      icon: <FaStethoscope className="text-sky-600" />,
      title: 'Orden médica digital',
      subtitle: 'Proceso clínico simple'
    },
    {
      icon: <FaRegClock className="text-emerald-600" />,
      title: 'Entrega rápida',
      subtitle: 'Disponible en minutos'
    },
    {
      icon: <FaHospital className="text-indigo-600" />,
      title: 'Uso nacional',
      subtitle: 'Laboratorios y clínicas'
    },
    {
      icon: <FaShieldAlt className="text-amber-600" />,
      title: 'Pago seguro',
      subtitle: 'Flujo protegido'
    }
  ];

  return (
    <section className="px-4 mt-4 md:mt-6 relative z-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TrustBand;
