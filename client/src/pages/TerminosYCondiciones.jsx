import React from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';

function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Términos y Condiciones
          </h1>

          <div className="prose max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder y utilizar el sitio web SiempreSalud, usted acepta cumplir con estos
                términos y condiciones. Si no está de acuerdo con alguna parte de estos términos,
                no debe utilizar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Servicios Médicos
              </h2>
              <p>
                SiempreSalud proporciona una plataforma para solicitar órdenes médicas y agendar
                citas de telemedicina. Los servicios médicos son proporcionados por profesionales
                de la salud certificados. SiempreSalud actúa como intermediario y no se hace
                responsable de los diagnósticos o tratamientos proporcionados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Registro de Usuario
              </h2>
              <p>
                Para utilizar nuestros servicios, debe crear una cuenta proporcionando información
                precisa y completa. Usted es responsable de mantener la confidencialidad de su
                contraseña y de todas las actividades que ocurran bajo su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Privacidad y Protección de Datos
              </h2>
              <p>
                La información de salud es altamente sensible. Nos comprometemos a proteger su
                información personal y médica de acuerdo con las leyes de protección de datos
                aplicables. Consulte nuestra Política de Privacidad para más detalles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Pagos y Reembolsos
              </h2>
              <p>
                Los pagos se procesan a través de pasarelas de pago seguras. Las políticas de
                reembolso se aplican según el tipo de servicio contratado. Los reembolsos están
                sujetos a nuestras políticas internas y a las condiciones del proveedor de servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Limitación de Responsabilidad
              </h2>
              <p>
                SiempreSalud no será responsable de ningún daño directo, indirecto, incidental o
                consecuente que resulte del uso o la imposibilidad de usar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Modificaciones
              </h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los
                cambios entrarán en vigor al publicarse en el sitio web. Se recomienda revisar
                periódicamente estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Ley Aplicable
              </h2>
              <p>
                Estos términos se rigen por las leyes de Chile. Cualquier disputa será resuelta
                en los tribunales competentes de Chile.
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

export default TerminosYCondiciones;
