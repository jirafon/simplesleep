import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaHeartbeat, FaUser, FaUserTie } from 'react-icons/fa';
import mujer35Image from '../../assets/mujer35.png';
import hombre50Image from '../../assets/hombre50.png';

function ServicesHero() {
  const highlights = [
    'Orientación clínica clara',
    'Selección por programa',
    'Flujo rápido y moderno'
  ];

  const programs = [
    {
      title: 'Salud Hombre',
      description: 'Control integral para prevención, metabolismo y salud cardiovascular.',
      icon: <FaUserTie className="text-blue-700 text-2xl" />,
      image: hombre50Image,
      imageClass: 'object-center',
      href: '/salud-hombre',
      accent: 'from-blue-600 to-indigo-700',
      bullets: ['Chequeos por edad', 'Enfoque cardiovascular', 'Exámenes personalizados']
    },
    {
      title: 'Salud Mujer',
      description: 'Programas enfocados en prevención, control hormonal y bienestar femenino.',
      icon: <FaUser className="text-fuchsia-700 text-2xl" />,
      image: mujer35Image,
      imageClass: 'object-center',
      href: '/salud-mujer',
      accent: 'from-fuchsia-600 to-rose-700',
      bullets: ['Control preventivo', 'Salud ginecológica', 'Exámenes por etapa']
    }
  ];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-10 -right-24 w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center mb-12">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white border border-blue-100 text-blue-700 rounded-full px-3 py-1 mb-5 shadow-sm">
              Siempresalud
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              Órdenes médicas para tus necesidades inmediatas.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl">
              Agenda tus exámenes de forma simple y rápida, y próximamente también podrás acceder a telemedicina.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {highlights.map((item) => (
                <span key={item} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                  <FaCheckCircle className="text-emerald-600 mr-2" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-stretch">
            {programs.map((program) => (
              <article key={program.title} className="group h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {program.image ? (
                  <img
                    src={program.image}
                    alt={program.title}
                    className={`w-full h-36 rounded-2xl object-cover border border-slate-200 mb-5 ${program.imageClass || 'object-center'}`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${program.accent} flex items-center justify-center text-white shadow-sm mb-5`}>
                    {program.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{program.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-5">{program.description}</p>
                <ul className="space-y-2 mb-6">
                  {program.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-slate-700">
                      <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  to={program.href}
                  className={`inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${program.accent} hover:opacity-95 transition gap-2 mt-auto`}
                >
                  Explorar
                  <FaArrowRight className="text-sm" />
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Beneficios rápidos */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Entrega Inmediata</p>
              <p className="text-xs text-slate-600">Recibe tu orden al instante</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Válido en Todo Chile</p>
              <p className="text-xs text-slate-600">Aceptado en laboratorios y clínicas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Bitácora Personal</p>
              <p className="text-xs text-slate-600">Guarda y revisa tus órdenes</p>
            </div>
          </div>
        </div>

        {/* Info Banner - Más sutil */}
        <div className="bg-white border border-blue-100 rounded-xl p-6 text-center shadow-sm">
          <p className="text-slate-700">
            <FaCheckCircle className="inline mr-2 text-blue-600" />
            <span className="font-semibold">Crea tu cuenta gratuita</span> para activar tu Bitácora y guardar todas tus órdenes médicas en un solo lugar.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ServicesHero;
