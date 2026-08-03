import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaUser, FaUserTie } from 'react-icons/fa';
import mujer35Image from '../../assets/mujer35.png';
import hombre50Image from '../../assets/hombre50.png';

function HeroSection() {
  const programs = [
    {
      id: 'salud-hombre',
      title: 'Salud Hombre',
      icon: <FaUserTie className="text-blue-700" />,
      image: hombre50Image,
      imageClass: 'object-center',
      description: 'Evaluación preventiva para metabolismo, corazón y bienestar general.',
      points: ['Chequeo por etapa', 'Perfil integral', 'Ruta rápida'],
      href: '/salud-hombre',
      accent: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'salud-mujer',
      title: 'Salud Mujer',
      icon: <FaUser className="text-fuchsia-700" />,
      image: mujer35Image,
      imageClass: 'object-center',
      description: 'Programas orientados a prevención, control hormonal y salud femenina.',
      points: ['Control preventivo', 'Salud ginecológica', 'Acompañamiento clínico'],
      href: '/salud-mujer',
      accent: 'from-fuchsia-600 to-rose-700'
    }
  ];

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white border border-blue-100 text-blue-700 rounded-full px-3 py-1 mb-5 shadow-sm">
              SiempreSalud
            </p>
            <p className="text-base md:text-lg font-semibold text-blue-800 mb-4">
              Siempre salud: Prevenir te permite disfrutar la vida mejor
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Atención médica, redefinida para la vida real.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
              Brindamos atención médica online: simple, directa y liderada por profesionales licenciados. Sin salas de espera. Sin pasos innecesarios. Solo atención que funciona.
            </p>

            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-black transition"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-stretch">
            {programs.map((program) => (
              <article key={program.id} className="group h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <img
                  src={program.image}
                  alt={program.title}
                  className={`w-full h-40 rounded-2xl object-cover border border-slate-200 mb-4 ${program.imageClass || 'object-center'}`}
                />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{program.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{program.description}</p>
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

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Programas de salud</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <article
              key={program.id}
              id={program.id}
              className="scroll-mt-28 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-7 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {program.image ? (
                    <img
                      src={program.image}
                      alt={program.title}
                      className={`w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm ${program.imageClass || 'object-center'}`}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                      {program.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{program.title}</h3>
                    <p className="text-sm text-slate-600">{program.description}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-slate-600 border-slate-200">
                  Programa
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {program.points.map((point) => (
                  <div key={point} className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <FaCheckCircle className="inline mr-2 text-emerald-600" />
                    {point}
                  </div>
                ))}
              </div>

              <Link
                to={program.href}
                className={`inline-flex items-center gap-2 text-white px-5 py-3 rounded-xl font-semibold bg-gradient-to-r ${program.accent} hover:opacity-95 transition`}
              >
                Explorar programa
                <FaArrowRight className="text-sm" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
