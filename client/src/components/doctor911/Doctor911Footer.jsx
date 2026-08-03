import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function SaludSimpleFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Siempresalud</h3>
            <p className="text-gray-400 mb-4">
              Resultados que hacen la diferencia. Servicios médicos accesibles 24/7 con cobertura nacional.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <FaEnvelope />
                <span>contacto@unbiax.com</span>
              </div>
           
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/servicios" className="hover:text-white transition">
                  Órdenes Médicas
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-white transition">
                  Telemedicina
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-white transition">
                  Exámenes Preventivos
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-white transition">
                  Órdenes Personalizadas
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Información</h4>
            <ul className="space-y-2 text-gray-400">
          
              <li>
                <Link to="/contacto" className="hover:text-white transition">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="hover:text-white transition">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/terminos-y-condiciones" className="hover:text-white transition">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/privacidad" className="hover:text-white transition">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="font-semibold mb-2">Hablemos!</h5>
              <p className="text-sm text-gray-400">
                ¿Tienes preguntas? Estamos aquí para ayudarte.
              </p>
              <Link
                to="/contacto"
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Siempresalud. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs">
              Fundado por Roberto Merino • Universidad Católica
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SaludSimpleFooter;
