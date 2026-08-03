import React, { useState } from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaNewspaper, FaCalendarAlt, FaTimes } from 'react-icons/fa';

function Noticias() {
  const [selectedNoticia, setSelectedNoticia] = useState(null);

  // Placeholder news - in production, this would come from a CMS or API
  const noticias = [
    {
      id: 1,
      title: 'SiempreSalud Expande Cobertura a Todas las Regiones de Chile',
      date: '2024-01-15',
      excerpt: 'Nuestra plataforma ahora está disponible en todas las regiones del país, llevando servicios médicos accesibles a áreas rurales y urbanas por igual.',
      category: 'Actualización',
      content: `SiempreSalud está orgulloso de anunciar que nuestra plataforma ahora está disponible en todas las regiones de Chile, desde Arica y Parinacota hasta Magallanes y la Antártica Chilena.

Esta expansión representa un hito importante en nuestra misión de hacer que los servicios médicos sean accesibles para todos los chilenos, independientemente de dónde vivan.

**Cobertura Nacional Completa**

Con esta expansión, los usuarios en áreas rurales y urbanas de todo el país ahora pueden:
- Acceder a órdenes médicas para exámenes de forma rápida y sencilla
- Utilizar nuestra plataforma de telemedicina desde cualquier lugar
- Mantener un registro completo de su historial médico en su bitácora personal

**Impacto en Comunidades Rurales**

Esta expansión es especialmente significativa para las comunidades rurales que históricamente han tenido dificultades para acceder a servicios médicos. Ahora, los residentes de estas áreas pueden:
- Obtener órdenes médicas sin necesidad de viajar largas distancias
- Realizar consultas médicas a través de telemedicina
- Mantener un seguimiento continuo de su salud

**Próximos Pasos**

Continuaremos trabajando para mejorar nuestros servicios y agregar nuevas funcionalidades que beneficien a todos nuestros usuarios en todo Chile.`
    },
    {
      id: 2,
      title: 'Nuevo Sistema de Telemedicina Mejorado',
      date: '2024-01-10',
      excerpt: 'Hemos mejorado nuestro sistema de telemedicina con mejor calidad de video y nuevas funcionalidades para una experiencia más fluida.',
      category: 'Tecnología',
      content: `SiempreSalud ha lanzado una versión mejorada de su sistema de telemedicina, con mejoras significativas en calidad de video, estabilidad de conexión y nuevas funcionalidades diseñadas para mejorar la experiencia tanto de pacientes como de médicos.

**Mejoras en Calidad de Video**

La nueva versión incluye:
- Calidad de video HD mejorada para consultas más claras
- Mejor compresión de video para conexiones de internet más lentas
- Estabilidad mejorada de la conexión con menor latencia

**Nuevas Funcionalidades**

Hemos agregado varias funcionalidades nuevas que hacen que las consultas de telemedicina sean más efectivas:

1. **Compartir Pantalla**: Los médicos ahora pueden compartir su pantalla para mostrar resultados de exámenes o explicar conceptos médicos
2. **Grabación de Consultas**: Con el consentimiento del paciente, las consultas pueden ser grabadas para referencia futura
3. **Chat Integrado**: Los usuarios pueden enviar mensajes de texto durante la consulta para complementar la conversación
4. **Prescripción Digital**: Los médicos pueden enviar prescripciones y órdenes médicas directamente a través de la plataforma

**Mejoras en la Experiencia del Usuario**

La interfaz ha sido rediseñada para ser más intuitiva y fácil de usar:
- Navegación simplificada
- Indicadores visuales claros del estado de la conexión
- Instrucciones paso a paso para usuarios nuevos

**Privacidad y Seguridad**

Todas las consultas de telemedicina están protegidas con encriptación de extremo a extremo, asegurando que la información médica de los pacientes permanezca confidencial y segura.`
    },
    {
      id: 3,
      title: 'Importancia de los Exámenes Preventivos',
      date: '2024-01-05',
      excerpt: 'Los exámenes preventivos son fundamentales para detectar problemas de salud temprano. Conoce más sobre cómo SiempreSalud facilita el acceso a estos servicios.',
      category: 'Salud',
      content: `Los exámenes preventivos son una parte fundamental del cuidado de la salud. Permiten detectar problemas de salud en sus etapas tempranas, cuando son más fáciles de tratar y cuando el tratamiento es más efectivo.

**¿Por qué son Importantes los Exámenes Preventivos?**

Los exámenes preventivos pueden:
- Detectar enfermedades antes de que aparezcan síntomas
- Identificar factores de riesgo que pueden llevar a problemas de salud
- Proporcionar una línea base de salud para comparaciones futuras
- Reducir el riesgo de complicaciones graves
- Mejorar las posibilidades de tratamiento exitoso

**Tipos de Exámenes Preventivos Comunes**

1. **Exámenes de Sangre**: Incluyen hemograma completo, perfil lipídico, glucosa, y pruebas de función hepática y renal
2. **Exámenes de Imagen**: Como mamografías, ecografías y radiografías
3. **Exámenes Ginecológicos**: Incluyendo Papanicolaou (PAP) y exámenes pélvicos
4. **Exámenes Cardiovasculares**: Como electrocardiogramas y pruebas de esfuerzo
5. **Exámenes de Detección de Cáncer**: Como colonoscopias y pruebas de PSA

**Cómo SiempreSalud Facilita el Acceso**

SiempreSalud hace que sea más fácil que nunca acceder a exámenes preventivos:

- **Órdenes Médicas Rápidas**: Obtén tu orden médica en minutos sin necesidad de una cita previa
- **Variedad de Exámenes**: Accede a una amplia gama de exámenes preventivos
- **Bitácora Personal**: Mantén un registro de todos tus exámenes y resultados en un solo lugar
- **Recordatorios**: Recibe recordatorios sobre cuándo es el momento de realizar tus exámenes preventivos

**Recomendaciones Generales**

Se recomienda que los adultos realicen exámenes preventivos regulares según su edad, género y factores de riesgo. Consulta con tu médico para determinar qué exámenes son apropiados para ti.

**Conclusión**

Los exámenes preventivos son una inversión en tu salud a largo plazo. Con SiempreSalud, hacer estos exámenes es más conveniente y accesible que nunca.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Noticias
          </h1>
          <p className="text-xl text-gray-600">
            Mantente informado sobre las últimas actualizaciones y noticias de SiempreSalud
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {noticias.map((noticia) => (
            <article
              key={noticia.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {noticia.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaCalendarAlt className="mr-2" />
                    {new Date(noticia.date).toLocaleDateString('es-CL')}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {noticia.title}
                </h2>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {noticia.excerpt}
                </p>

                <button 
                  onClick={() => setSelectedNoticia(noticia)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center transition"
                >
                  Leer más
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {noticias.length === 0 && (
          <div className="text-center py-12">
            <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No hay noticias disponibles en este momento.
            </p>
          </div>
        )}
      </div>

      {/* Modal para leer noticia completa */}
      {selectedNoticia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNoticia(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedNoticia.category}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaCalendarAlt className="mr-2" />
                  {new Date(selectedNoticia.date).toLocaleDateString('es-CL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedNoticia(null)}
                className="text-gray-400 hover:text-gray-600 transition p-2"
                aria-label="Cerrar"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedNoticia.title}
              </h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {selectedNoticia.content.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  
                  // Detectar títulos (líneas que empiezan y terminan con **)
                  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                        {trimmed.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  
                  // Detectar listas con viñetas
                  if (trimmed.includes('\n-') || (trimmed.startsWith('-') && trimmed.includes('\n'))) {
                    const lines = trimmed.split('\n').filter(line => line.trim());
                    const listItems = lines.filter(line => line.trim().startsWith('-'));
                    
                    if (listItems.length > 0) {
                      return (
                        <ul key={index} className="list-disc pl-6 mt-4 mb-4 space-y-2">
                          {listItems.map((item, itemIndex) => {
                            // Remover el guión y el ** si existe
                            let cleanItem = item.replace(/^-\s*/, '').trim();
                            // Convertir **texto** a <strong>texto</strong>
                            cleanItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            return (
                              <li key={itemIndex} className="text-gray-700" dangerouslySetInnerHTML={{ __html: cleanItem }} />
                            );
                          })}
                        </ul>
                      );
                    }
                  }
                  
                  // Detectar listas numeradas
                  if (/^\d+\./.test(trimmed)) {
                    const lines = trimmed.split('\n').filter(line => line.trim());
                    const listItems = lines.filter(line => /^\d+\./.test(line.trim()));
                    
                    if (listItems.length > 0) {
                      return (
                        <ol key={index} className="list-decimal pl-6 mt-4 mb-4 space-y-2">
                          {listItems.map((item, itemIndex) => {
                            let cleanItem = item.replace(/^\d+\.\s*/, '').trim();
                            cleanItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            return (
                              <li key={itemIndex} className="text-gray-700" dangerouslySetInnerHTML={{ __html: cleanItem }} />
                            );
                          })}
                        </ol>
                      );
                    }
                  }
                  
                  // Párrafos normales con negritas
                  if (trimmed.length > 0) {
                    let processedText = trimmed;
                    // Convertir **texto** a <strong>texto</strong>
                    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p key={index} className="mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: processedText }} />
                    );
                  }
                  
                  return null;
                })}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedNoticia(null)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <SaludSimpleFooter />
    </div>
  );
}

export default Noticias;
