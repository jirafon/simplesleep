import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaUser, FaUserTie, FaCheckCircle, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

function PersonalizaTuOrden() {
  const navigate = useNavigate();

  const handleSelectOption = (option) => {
    // Navegar a la página correspondiente
    if (option === 'hombre') {
      navigate('/orden-hombre');
    } else if (option === 'mujer') {
      navigate('/orden-mujer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-300/20 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-4xl">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-4">
              <FaShieldAlt className="text-blue-200" />
              Orden Personalizada
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Diseña tu orden médica con una experiencia clara y profesional
            </h1>
            <p className="text-slate-200 text-base md:text-lg max-w-3xl">
              Elige tu ruta según perfil y obtén una interfaz optimizada para seleccionar exámenes rápido, con menos pasos y mayor claridad.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-10">
          {/* Mujer */}
          <div 
            onClick={() => handleSelectOption('mujer')}
            className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-lg p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400" />
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-fuchsia-100 to-rose-100 rounded-2xl p-5 border border-fuchsia-200">
                  <FaUser className="text-fuchsia-700 text-5xl" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Mujer</h3>
              <p className="text-slate-600 mb-6">
                Exámenes personalizados con enfoque preventivo y de control integral.
              </p>
              <div className="inline-flex items-center justify-center gap-2 text-fuchsia-700 font-semibold">
                <span>Entrar a selección</span>
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* Hombre */}
          <div 
            onClick={() => handleSelectOption('hombre')}
            className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-lg p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl p-5 border border-sky-200">
                  <FaUserTie className="text-blue-700 text-5xl" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Hombre</h3>
              <p className="text-slate-600 mb-6">
                Exámenes personalizados con foco metabólico, cardiovascular y preventivo.
              </p>
              <div className="inline-flex items-center justify-center gap-2 text-blue-700 font-semibold">
                <span>Entrar a selección</span>
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <FaCheckCircle className="text-blue-600 text-2xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                Recuerda crear tu cuenta
              </h3>
              <p className="text-slate-700">
                Para activar tu Bitácora. Ahí podrás ver y guardar tus órdenes de examen de forma ordenada y siempre disponible.
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 inline-block">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaLock className="text-green-600 text-2xl" />
              <h3 className="text-xl font-semibold text-slate-900">Pago seguro</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Tu seguridad es nuestra prioridad para garantizar que tu información esté protegida en todo momento.
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200">
                <span className="text-sm text-slate-700">Transbank</span>
              </div>
              <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200">
                <span className="text-sm text-slate-700">Flow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default PersonalizaTuOrden;
