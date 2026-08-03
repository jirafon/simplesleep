import React from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';

function Privacidad() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Política de Privacidad
          </h1>

          <div className="prose max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Información que Recopilamos
              </h2>
              <p>
                Recopilamos información personal que usted nos proporciona directamente, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nombre completo y datos de contacto</li>
                <li>Información de salud y médica</li>
                <li>Historial de órdenes médicas y citas</li>
                <li>Información de pago (procesada de forma segura)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Uso de la Información
              </h2>
              <p>
                Utilizamos su información para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar y mejorar nuestros servicios médicos</li>
                <li>Procesar órdenes médicas y citas</li>
                <li>Mantener su bitácora personal</li>
                <li>Comunicarnos con usted sobre sus servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Protección de Datos
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su
                información personal y médica. Utilizamos encriptación, controles de acceso y
                monitoreo continuo para garantizar la seguridad de sus datos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Compartir Información
              </h2>
              <p>
                No vendemos ni compartimos su información personal con terceros, excepto:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Con profesionales de la salud que proporcionan servicios</li>
                <li>Cuando sea requerido por ley</li>
                <li>Con su consentimiento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Sus Derechos
              </h2>
              <p>
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a su información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Exportar sus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Cookies y Tecnologías de Seguimiento
              </h2>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar su experiencia y analizar
                el uso del sitio. Puede configurar su navegador para rechazar cookies, aunque
                esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cambios a esta Política
              </h2>
              <p>
                Podemos actualizar esta política de privacidad periódicamente. Le notificaremos
                sobre cambios significativos mediante email o mediante un aviso en el sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Contacto
              </h2>
              <p>
                Si tiene preguntas sobre esta política de privacidad o desea ejercer sus derechos sobre datos personales,
                puede escribirnos a{' '}
                <a href="mailto:contacto@unbiax.com" className="text-blue-600 hover:underline">
                  contacto@unbiax.com
                </a>.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default Privacidad;
