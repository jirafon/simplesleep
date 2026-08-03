import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaUser, FaUserTie } from 'react-icons/fa';

function OrdenPreventiva() {
  const navigate = useNavigate();

  const handleSelectGender = (gender) => {
    navigate(`/orden-preventiva-${gender}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Orden Preventiva
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona tu género para ver los paquetes de exámenes preventivos disponibles
          </p>
        </div>

        {/* Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Mujer */}
          <div 
            onClick={() => handleSelectGender('mujer')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-pink-100 rounded-full p-6">
                  <FaUser className="text-pink-600 text-5xl" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Mujer</h3>
              <p className="text-gray-600 mb-6">
                Paquetes de exámenes preventivos para mujeres
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <span>Seleccionar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hombre */}
          <div 
            onClick={() => handleSelectGender('hombre')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 rounded-full p-6">
                  <FaUserTie className="text-blue-600 text-5xl" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Hombre</h3>
              <p className="text-gray-600 mb-6">
                Paquetes de exámenes preventivos para hombres
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <span>Seleccionar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="text-blue-600 text-2xl mt-1 flex-shrink-0">ℹ️</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Recuerda crear tu cuenta
              </h3>
              <p className="text-gray-700">
                Para activar tu Bitácora. Ahí podrás ver y guardar tus órdenes de examen de forma ordenada y siempre disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default OrdenPreventiva;
