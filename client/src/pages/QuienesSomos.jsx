import React from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import robertoPhoto from '../assets/roberto.png';

function QuienesSomos() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <section className="bg-gradient-to-r from-sky-900 via-blue-800 to-cyan-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
            <p className="text-sm sm:text-base tracking-wide uppercase text-cyan-100 mb-3">
              Quiénes Somos
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Conoce a Nuestros Fundadores
            </h1>
            <p className="mt-5 max-w-3xl text-base sm:text-lg text-cyan-50">
              En SiempreSalud creemos que el futuro de la salud no debe comenzar cuando aparece la enfermedad,
              sino mucho antes: en la prevención, el acompañamiento y el acceso oportuno al bienestar.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14 lg:py-16">
          <div className="grid lg:grid-cols-[360px,1fr] gap-8 lg:gap-12 items-start">
            <article className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <img
                src={robertoPhoto}
                alt="Roberto Merino Dezerega"
                className="w-full h-auto object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900">Roberto Merino Dezerega</h2>
                <p className="mt-2 text-sky-700 font-semibold">
                  Cofundador · Visión Estratégica y Bienestar Preventivo
                </p>
              </div>
            </article>

            <article className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 lg:p-10">
              <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
                Roberto Merino Dezerega impulsa una visión centrada en las personas, promoviendo soluciones que
                integran salud preventiva, tecnología y cercanía humana para mejorar la calidad de vida de las
                familias y comunidades.
              </p>

              <p className="mt-5 text-slate-700 leading-relaxed text-base sm:text-lg">
                Su enfoque busca construir una experiencia de salud moderna, confiable y accesible, donde cada
                persona pueda contar con herramientas, orientación y seguimiento continuo para vivir mejor y por
                más tiempo.
              </p>

              <blockquote className="mt-8 border-l-4 border-sky-500 pl-5 italic text-sky-900 text-lg sm:text-xl leading-relaxed">
                "La salud del futuro debe ser preventiva, cercana y capaz de acompañar a las personas en cada
                etapa de su vida."
              </blockquote>

              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Lo que impulsa SiempreSalud</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li>✔ Bienestar preventivo y longevidad saludable</li>
                    <li>✔ Acceso cercano y humano a soluciones de salud</li>
                    <li>✔ Tecnología aplicada al cuidado continuo</li>
                    <li>✔ Educación y acompañamiento para pacientes</li>
                    <li>✔ Innovación enfocada en calidad de vida</li>
                  </ul>
                </div>

                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Nuestra visión</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Construir una plataforma de bienestar y salud preventiva que combine innovación, confianza y
                    acompañamiento humano para transformar positivamente la vida de las personas.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <SaludSimpleFooter />
    </div>
  );
}

export default QuienesSomos;