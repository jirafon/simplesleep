import React, { useState } from 'react';
import { Typography, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const sections = [
  {
    title: "¿Las denuncias son realmente anónimas?",
    content: `
      <Typography variant="body1" align="left">
        Sí, aunque guardamos el email de quien realizó la denuncia, si el usuario escoge no dar su nombre es opcional. Aunque lo hiciera, no se muestran los datos a ningún usuario ni compartimos esta información de ninguna forma, respetando el uso confidencial de la información.
      </Typography>
    `,
  },
  {
    title: "¿Qué uso le da Unbiax a la información que maneja?",
    content: `
      <div>
      <Typography variant="body1" align="left">
          En Unbiax, valoramos y respetamos la privacidad de nuestros usuarios y la confidencialidad de la información que manejan en nuestra plataforma. Nuestra organización tiene una política clara en cuanto al uso de la información, y nos gustaría explicarte cómo gestionamos los datos que recopilamos:
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>Uso de la información:</strong> La información que nuestros usuarios proporcionan a través de la plataforma de Unbiax se utiliza exclusivamente para fines relacionados con nuestros servicios y funciones. Esta información es fundamental para facilitar la gestión de declaraciones, campañas y otras actividades dentro de la plataforma.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>Confidencialidad y seguridad:</strong> Mantenemos un estricto nivel de confidencialidad y seguridad en relación con la información que recopilamos. Implementamos medidas técnicas y organizativas para proteger los datos contra el acceso no autorizado, la divulgación y el uso indebido.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>No compartimos con terceros:</strong> Es importante destacar que en Unbiax no compartimos, vendemos ni proporcionamos la información de nuestros usuarios a terceros, ya sean empresas, organizaciones o individuos. La información que recopilamos se mantiene dentro de nuestra plataforma y se utiliza exclusivamente para mejorar la experiencia de nuestros usuarios y brindarles un servicio de calidad.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>Uso interno en Unbiax:</strong> La información que recopilamos se utiliza para optimizar y personalizar la experiencia del usuario en nuestra plataforma. Esto incluye aspectos como facilitar la navegación, proporcionar recomendaciones relevantes y mejorar nuestras funcionalidades.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>Consentimiento del usuario:</strong> Siempre solicitamos el consentimiento expreso de nuestros usuarios para recopilar y utilizar su información. Los usuarios tienen el control sobre los datos que comparten y pueden acceder, editar o eliminar su información en cualquier momento.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          <strong>Transparencia y comunicación:</strong> En Unbiax nos comprometemos a mantener una comunicación transparente con nuestros usuarios sobre cómo se utiliza la información y cuáles son sus derechos en relación con sus datos personales. Si tienes alguna pregunta o inquietud sobre el manejo de la información, no dudes en ponerte en contacto con nuestro equipo de soporte.
        </Typography>
        <br />
        <hr />
        <br />
      <Typography variant="body1" align="left">
          En resumen, en Unbiax utilizamos la información con responsabilidad y ética, enfocándonos en brindar un servicio eficiente y seguro a nuestros usuarios. Tu confianza es fundamental para nosotros, y estamos aquí para garantizar que tus datos estén protegidos y utilizados de manera adecuada dentro de nuestra plataforma.
        </Typography>
      </div>
    `,
  },
  {
    title: "¿Qué significa Funcionario Público?",
    content: `
      <div>
      <Typography variant="body1" align="left">
          Significa e incluye:
        </Typography>
        <br />
        <hr />
        <br />
        <ol>
          <li>
            Cualquier oficial o empleado de gobierno o de una organización pública internacional o cualquier departamento o agencia del mismo o cualquier otra entidad de propiedad del estado o controladas por éste (incluidas las empresas de propiedad estatal).
          </li>
          <li>
            Cualquier persona que actúe en una función oficial o empoderada de un gobierno u organización pública internacional.
          </li>
          <li>
            Cualquier dirigente de un partido político o candidato a un cargo público.
          </li>
          <li>
            Cualquier persona que tiene o ejerce las funciones de representación, oficio o cargo creado especialmente, incluyendo, potencialmente, algunos líderes de etnias y comunidades.
          </li>
          <li>
            Cualquier persona independiente que esté autorizada para representar a un funcionario del gobierno.
          </li>
        </ol>
      </div>
    `,
  },
  {
    title: "¿Qué es Persona Expuesta Públicamente (PEP)?",
    content: `
      <div>
      <Typography variant="body1" align="left">
          La Unidad de Análisis Financieros (UAF), según Circular N°49, indica que la Persona Expuesta Políticamente (PEP) son los chilenos o extranjeros que desempeñan o hayan desempeñado funciones públicas destacadas en un país, hasta a lo menos un año de finalizado el ejercicio de las mismas.
        </Typography>
      <Typography variant="body1" align="left">
          A lo menos deberán estar calificadas como PEP las siguientes personas (esta lista es a modo de ejemplo, no exhaustiva):
        </Typography>
        <br />
              <Typography variant="body1" align="left">1. Presidente de la República.</Typography><br />
              <Typography variant="body1" align="left">2. Senadores, Diputados y Alcaldes.</Typography><br />
              <Typography variant="body1" align="left">3. Ministros de la Corte Suprema y de las Cortes de Apelaciones.</Typography><br />
              <Typography variant="body1" align="left">4. Ministros de Estado, Subsecretarios, Intendentes, Gobernadores, Secretarios Regionales Ministeriales, Embajadores, Jefes Superiores de Servicios tanto centralizados como descentralizados y el directivo superior inmediato que deba subrogar a cada uno de ellos.</Typography><br />
              <Typography variant="body1" align="left">5. Comandantes en Jefe de las Fuerzas Armadas, General Director de Carabineros, Director General de Investigaciones y el superior inmediato que deba subrogar a cada uno de ellos.</Typography><br />
              <Typography variant="body1" align="left">6. Directores y ejecutivos principales de empresas públicas.</Typography><br />
              <Typography variant="body1" align="left">7. Directores de sociedades anónimas nombrados por el Estado o sus organismos.</Typography><br />
              <Typography variant="body1" align="left">8. Miembros de las directivas de los partidos políticos.</Typography><br />
              <Typography variant="body1" align="left">9. Fiscal Nacional del Ministerio Público y Fiscales Regionales.</Typography><br />
              <Typography variant="body1" align="left">10. Contralor General de la República.</Typography><br />
              <Typography variant="body1" align="left">11. Consejeros del Banco Central de Chile.</Typography><br />
              <Typography variant="body1" align="left">12. Presidente y Consejeros del Consejo de Defensa del Estado.</Typography><br />
              <Typography variant="body1" align="left">13. Ministros del Tribunal Constitucional.</Typography><br />
              <Typography variant="body1" align="left">14. Ministros del Tribunal de la Libre Competencia.</Typography><br />
              <Typography variant="body1" align="left">15. Integrantes titulares y suplentes del Tribunal de Contratación Pública.</Typography><br />
              <Typography variant="body1" align="left">16. Miembros del Consejo de Alta Dirección Pública.</Typography><br />
              <Typography variant="body1" align="left">17. Consejeros Regionales (CORE).</Typography><br />
              <Typography variant="body1" align="left">18. Concejales.</Typography><br />
              <Typography variant="body1" align="left">19. Todos los candidatos en elecciones presidenciales, parlamentarias y municipales. De igual forma, las personas, naturales o jurídicas, con o sin fines de lucro, vinculadas a algún candidato a cargo de elección popular, desde el momento de inscripción de la respectiva candidatura, conforme a las disposiciones legales aplicables.</Typography>
      </div>
    `,
  },
 {/* {
    title: "Ley N°21.595 de Responsabilidad Penal de las Personas Jurídicas, IMPORTANTE Fechas de Implementación",
    content: `
      <div>
              <Typography variant="body1" align="left">
          La Ley N°21.595 establece que las personas jurídicas serán responsables de los siguientes delitos:
        </Typography>
        <ul>
          <li>Lavado de activos</li>
          <li>Financiamiento del terrorismo</li>
          <li>Cohecho a funcionario público nacional y extranjero</li>
          <li>Corrupción entre privados</li>
          <li>Fraude al Fisco</li>
          <li>Delitos previstos en la Ley de Seguridad Interior del Estado</li>
        </ul>
              <Typography variant="body1" align="left">
          A continuación, se presentan algunas fechas clave para la implementación de la Ley N°21.595:
        </Typography>
        <ul>
          <li>
            <strong>Fecha de publicación:</strong> La Ley N°21.595 fue publicada en el Diario Oficial el 18 de agosto de 2009.
          </li>
          <li>
            <strong>Fecha de entrada en vigor:</strong> La ley entró en vigor el 1 de diciembre de 2009.
          </li>
          <li>
            <strong>Plazos de adaptación:</strong> Las empresas tienen un plazo para adecuar sus sistemas y procedimientos internos, generalmente de 6 a 12 meses a partir de la entrada en vigor de la ley.
          </li>
          <li>
            <strong>Revisión y actualización:</strong> Las empresas deben revisar y actualizar sus políticas y procedimientos de manera periódica para asegurar el cumplimiento continuo.
          </li>
        </ul>
              <Typography variant="body1" align="left">
          Es fundamental que las empresas implementen un programa de cumplimiento efectivo para prevenir, detectar y responder adecuadamente a los delitos establecidos por la ley.
        </Typography>
      </div>
    `,
  },
  */}
];

const FAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className="relative">

    <div style={{ backgroundColor: 'rgb(236, 253, 255)', padding: '16px' }}>
    <h6 className=' text-center md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Preguntas Frecuentes</h6>

    <div className='max-w-[1240px] mx-auto text-left'>


      {sections.map((section, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '800px',
            margin: '0 auto',
            transition: 'box-shadow 0.3s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'left' }}>
            <Typography
              variant="h6"
              onClick={() => handleToggle(index)}
              style={{
                cursor: 'pointer',
                margin: 0,
                fontWeight: 'bold',
              }}
            >
              {section.title}
            </Typography>
            <IconButton
              onClick={() => handleToggle(index)}
              style={{ marginLeft: 'auto' }}
            >
              {expandedIndex === index ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </IconButton>
          </div>
          {expandedIndex === index && (
            <div
              dangerouslySetInnerHTML={{ __html: section.content }}
              style={{ marginTop: '16px' }}
            />
          )}
        </div>
      ))}
    </div>
    </div>

    </section>
  );
};

export default FAQSection;