import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';

const QuizResultsModal = ({ onClose, obtainedPoints, totalPoints, percentage }) => (
  <div className='modal'>
    <div className='modal-content'>
      <span className='close' onClick={onClose}>&times;</span>
      <h2>Hemos recibido sus datos y su resultados de la Encuesta</h2>
      <p>Su resultado es {obtainedPoints} puntos de un total de {totalPoints} puntos.</p>
      <p>Su porcentaje de avance es {percentage}%.</p>
      <button onClick={onClose} className='bg-[#00df9a] text-black rounded-md font-medium w-[200px] mx-auto my-6 px-6 py-3'>Cerrar</button>
      
      
    </div>
  </div>
);

const PrivacyPolicyModal = ({ onClose }) => (
  <div className='modal'>
  <div className='modal-content' style={{ maxHeight: '70%', overflowY: 'auto' }}>
    <span className='close' onClick={onClose} style={{ color: 'limegreen' }}>&times;</span>
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold py-2 text-center">
      Política de Privacidad
    </h2>
    <div className='text-justify space-y-4'>
      <p>
    El acceso a determinados servicios que se ofrecen en el sitio puede requerir el ingreso de datos personales, a saber: dirección de e-mail, nombre, apellido, domicilio completo, tipo y número de documento y otros datos opcionales, o cualquier otra información que permita individualizarlo. En todos los casos que usted brinde información personal, y de acuerdo a la legislación vigente, usted declara que la información brindada es cierta.
  </p>
  <p>
    Los datos que usted ingrese al Sitio se utilizarán para: envío de información de Productos y servicios, reporte de Irregularidades, análisis e investigaciones, Compliance, Asesoramiento legal, aplicaciones de servicios de proceso de negociación y gestión de reclamos previo a la judicialización, sistemas de comunicación internos y externos, obtener estadísticas.
  </p>
  <p>
    El ingreso de datos personales al Sitio por parte de los usuarios es voluntario, sin embargo, Unbiax manifiesta que su ingreso facilitará el uso de los servicios que ofrece y la relación con los usuarios. En los casos en que usted nos brinde su información personal, usted acepta y presta su consentimiento libre, expreso e informado para que dicha información personal sea utilizada en su propio beneficio optimizando la calidad del servicio que le ofrecemos a fin de mantenerlo informado de posibles cambios, y autoriza a que la misma sea tratada, almacenada, recopilada en la base de datos de la compañía.
  </p>
  <p>
    Unbiax garantiza a los usuarios que ingresen sus datos en el Sitio, que los mismos serán encriptados para preservar la seguridad, integridad y confidencialidad de los datos considerados como personales. Unbiax realiza todos los esfuerzos necesarios para evitar su adulteración, pérdida, consulta o tratamiento no autorizado, que permitan detectar desviaciones, intencionales o no, de información, ya sea que los riesgos provengan de la acción humana o del medio técnico utilizado. Para ello, notificamos de nuestras prácticas de privacidad, y las alternativas sobre la manera que su información es recopilada y utilizada.
  </p>
  <p>
    El sistema de encriptado implica que los datos solo podrán ser interpretados por Unbiax y ningún intermediario tendrá acceso a la información.
  </p>
  <p>
    El usuario podrá acceder a sus datos de carácter personal, rectificarlos, cancelarlos u oponerse a su tratamiento, mediante notificación al responsable de la base de datos contacto@unbiax.com (LATAM)
  </p>
  <p>
    Unbiax no cederá esta información con terceros. No obstante, Unbiax podrá enviar a sus usuarios ofertas promocionales o comunicados especiales, donde el usuario siempre tendrá la opción de solicitar dejar de recibirlos.
  </p>
  <p>
    El usuario responderá, en cualquier caso, de la veracidad de los datos facilitados, reservándose Unbiax el derecho de excluir a todo usuario que haya facilitado datos falsos, sin perjuicio de iniciar acciones legales.
  </p>
  <p>
    Unbiax se reserva el derecho de brindar información a organismos de control de cualquier país y/o autoridades judiciales que así lo requieran y cuando medien razones fundadas relativas a la seguridad pública, la defensa nacional o la salud pública.
  </p>
</div>

      

      {/* Add the rest of the privacy policy here */}
    </div>
  </div>
);

const ContactForm = ({ onSubmit, onInputChange, formData }) => {
  const { name, phone, company, email, comment, industria } = formData;
  return (
    <form onSubmit={onSubmit}>
      <div className='flex flex-col w-full'>
    <input
          className={`p-3 rounded-md text-black mb-4 ${email ? 'input-orange-border' : ''}`}
          type='email'
          placeholder='Email'
          value={email}
          onChange={onInputChange('email')}
          required
        />
        <input
          className={`p-3 rounded-md text-black mb-4 ${name ? 'input-orange-border' : ''}`}
          type='text'
          placeholder='Nombre'
          value={name}
          onChange={onInputChange('name')}
          required
        />
        <input
          className={`p-3 rounded-md text-black mb-4 ${phone ? 'input-orange-border' : ''}`}
          type='text'
          placeholder='Teléfono'
          value={phone}
          onChange={onInputChange('phone')}
          required
        />
        <input
          className={`p-3 rounded-md text-black mb-4 ${industria ? 'input-orange-border' : ''}`}
          type='text'
          placeholder='Rubro'
          value={industria}
          onChange={onInputChange('industria')}
        />
        <input
          className={`p-3 rounded-md text-black mb-4 ${company ? 'input-orange-border' : ''}`}
          type='text'
          placeholder='organización'
          value={company}
          onChange={onInputChange('company')}
        />
      
        <input
          className={`p-3 rounded-md text-black mb-4 ${comment ? 'input-orange-border' : ''}`}
          type='text'
          placeholder='Mensaje'
          value={comment}
          onChange={onInputChange('comment')}
        />
       
      </div>
    </form>
  );
};


const Quiz = ({ questions, currentQuestion, quizAnswers, onAnswerChange, onNext, onBack, onQuizSubmit }) => (
  <form onSubmit={currentQuestion === questions.length - 1 ? onQuizSubmit : undefined} className="mt-4 mr-4 ml-4">
    <h2 className="mt-4">{`Encuesta de Compliance - Pregunta ${currentQuestion + 1} / ${questions.length}`}</h2>
    <div className="mt-4">
      <h3>{questions[currentQuestion].question}</h3>
      <div className='mt-4 radio-container'>
        {questions[currentQuestion].options.map((option, index) => (
          <div key={index} className='mt-2'>
            <input
              type={questions[currentQuestion].name === 'q2' ? 'checkbox' : 'radio'} 
              name={questions[currentQuestion].name}
              value={option.label}
              checked={quizAnswers[questions[currentQuestion].name]?.includes(option.label)} 
              onChange={onAnswerChange}
              required={!quizAnswers[questions[currentQuestion].name]?.length && questions[currentQuestion].name !== 'q2'}
              className='mr-2'
            />
            <label className="ml-2">{option.label}</label>
          </div>
        ))}
      </div>
    </div>
    <p className="mt-4"></p>
    <div className='navigation-buttons mt-4'>
      <button type="button" onClick={onBack} disabled={currentQuestion === 0} className='bg-[#00df9a] text-black rounded-md font-medium w-[100px] mx-auto my-6 px-6 py-3'>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {currentQuestion < questions.length - 1 && (
        <button type="button" onClick={onNext} className='bg-[#00df9a] text-black rounded-md font-medium w-[100px] mx-auto my-6 px-6 py-3'>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
      {currentQuestion === questions.length - 1 && (
        <button type="submit" className='bg-[#00df9a] text-black rounded-md font-medium w-[100px] mx-auto my-6 px-6 py-3'>
          Enviar</button>
      )}
    </div>
  </form>
);





const Contacto = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [industria, setIndustria] = useState('');
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showQuizResultsModal, setShowQuizResultsModal] = useState(false);
  const [obtainedPoints, setObtainedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [percentage, setPercentage] = useState(0);


  const questions = [

    {
      question: '¿Cuáles son las principales prioridades de su organización en términos de compliance?',
      options: [
        { label: 'Inicial (sin implementación)', points: 0 },
        { label: 'Implementación de políticas y procedimientos', points: 1 },
        { label: 'Gestión de políticas y procedimientos', points: 2 },
        { label: 'Alineación de cultura de cumplimiento', points: 3 },
        { label: 'Reportes de gestión cumplimiento', points: 4 },

      ],
      name: 'q1',
      points: 5 // Máximo 5 puntos
    },
 
    {
      question: '¿Tiene algunos  de estos procedimientos que tengan un control real, escrito y efectivo, que cuentan con evidencia demostrable en todo momento y trazable para hacer seguimiento? Seleccione todas las que apliquen',
      options: [
        { label: 'Registros de reuniones', points: 2 },
        { label: 'Declaraciones de conflictos de interés', points: 2 },
        { label: 'Declaraciones de transferencias de valor', points: 2 },
        { label: 'Control de lectura de documentos', points: 2 },
        { label: 'Canal de denuncia anónima', points: 2 },
        { label: 'Campaña comunicacional', points: 2 },
        { label: 'Diligencia debida de contrapartes', points: 2 },
        { label: 'Diligencia debida de postulantes de empleo', points: 2 }
      ],
      name: 'q2',
      points: 16 // 8 opciones * 2 puntos cada una
    },
    {
      question: '¿Ha identificado las actividad o procesos de la persona juridica que impliquen riesgos de conducta delitiva?',
      options: [
        { label: 'Sí, hemos identificado todos los riesgos relevantes', points: 3 },
        { label: 'Hemos identificado algunos riesgos, pero falta profundizar', points: 2 },
        { label: 'No hemos realizado una identificación formal de riesgos', points: 1 }
      ],
      name: 'q3',
      points: 3 // Máximo 3 puntos
    },
    {
      question: '¿Ha designado su organización a una persona responsable con autonomía para  gestionar el cumplimiento del modelo de prevención de delitos?',
      options: [
        { label: 'Sí', points: 3 },
        { label: 'No', points: 0 },
        { label: 'En proceso', points: 2 }
      ],
      name: 'q4',
      points: 3 // Máximo 3 puntos
    },

    
      {
        "question": "¿Las definiciones de prevención de delitos económicos en su organización son de responsabilidad de?",
        "options": [
          { "label": "Directorio", "points": 2 },
          { "label": "Gerente General o CEO", "points": 2 },
          { "label": "Gerente de finanzas, CFO o controller", "points": 2 },
          { "label": "Gerente legal", "points": 3 },
          { "label": "Gerente de compliance", "points": 3 },
          { "label": "Auditoría", "points": 0 },
          { "label": "Otro", "points": 1 },
          { "label": "No tienen aún responsable claro", "points": 0 }
        ],
        "name": "q5",
        "points": 3
      },

    {
      question: 'Cúal es el número de empleados en su organización',
      options: [
        { label: 'Menos de 50', points: 0 },
        { label: 'Entre 50 y 100', points: 1 },
        { label: 'Entre 100 y 500', points: 2 },
        { label: 'Más de 500', points: 3 }
      ],
      name: 'q6',
      points: 3 // Máximo 3 puntos
    },
    
  ];
  
   

  

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  const handleContestarEncuestaClick = () => {
    setShowQuiz(true);
    setIsQuizStarted(false); // Reset the quiz started state
    setName(''); // Reset input values
    setEmail('');
    setPhone('');
    setCompany('');
    setIndustria('');
    setComment('');
  };

 

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
  
    let emailTemplate = `Hola, llegaron las siguientes respuestas de la encuesta junto con los detalles de contacto:\n\n`;
    emailTemplate += `<p><strong>Nombre:</strong> ${name}</p>`;
    emailTemplate += `<p><strong>Teléfono:</strong> ${phone}</p>`;
    emailTemplate += `<p><strong>organización:</strong> ${company}</p>`;
    emailTemplate += `<p><strong>Industria:</strong> ${industria}</p>`;
    emailTemplate += `<p><strong>Email:</strong> ${email}</p>`;
    emailTemplate += `<p><strong>Mensaje:</strong> ${comment}</p>`;
    emailTemplate += `<br/>Respuestas de la Encuesta:\n\n`;
  
    let totalPossiblePoints = 0; // Declaration
  
    totalPossiblePoints = questions.reduce((acc, question) => acc + question.points, 0); // Assignment
  
    let obtainedPoints = 0;
  
    questions.forEach((question, index) => {
      const answer = quizAnswers[question.name];
      emailTemplate += `
        <li>
          <p><strong>${index + 1}. ${question.question}</strong></p>
          <p>Respuesta: ${answer}</p>
        </li>
      `;
      const selectedOption = question.options.find(option => option.label === answer);
      if (selectedOption) {
        obtainedPoints += selectedOption.points;
      }
    });
  
    const percentage = ((obtainedPoints / totalPossiblePoints) * 100).toFixed(2);
  
    emailTemplate += `<p>Su resultado es ${obtainedPoints} puntos, de un total de ${totalPossiblePoints}. El % de avance es de ${percentage}%.</p>`;
  
    setShowQuizResultsModal(true);
    setObtainedPoints(obtainedPoints);
    setTotalPoints(totalPossiblePoints);
    setPercentage(percentage);
    setShowQuizResultsModal(true);
  
    try {
      // Enviar email inmediatamente
      console.log('Enviando email...');
      
      // Enviar email
      const apiBaseUrl = process.env.REACT_APP_BASE_URL || 'https://siempresalud-server.onrender.com';
      const emailResponse = await fetch(`${apiBaseUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: ['contacto@unbiax.com'],
          emailTemplate,
          subject: 'Respuestas de la Encuesta recibida',
        }),
      });
  
      // Guardar en MongoDB
      const prospectData = {
        companyName: company,
        rut: "",
        industry: industria || "other",
        size: "medium",
        website: "",
        address: "",
        contacts: [
          {
            name: name,
            role: "Contact",
            email: email,
            phone: phone,
            isPrimary: true
          }
        ],
        stage: "lead",
        source: "website",
        estimatedValue: null,
        probability: 10,
        expectedCloseDate: null,
        interestedProducts: [],
        score: obtainedPoints,
        priority: "medium",
        nextFollowUp: null,
        status: "active",
        notes: `${comment || ""}\n\nQuiz Results:\nPoints: ${obtainedPoints}/${totalPoints}\nPercentage: ${percentage}%\nAnswers: ${JSON.stringify(quizAnswers)}`,
        tags: ["quiz_response"],
        assignedTo: "",
        createdBy: "663bcab94879c7afd7e318ad"
      };

      const mongoResponse = await fetch('https://scraperut.onrender.com/crm/prospects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SCRAPER_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODlhMjg3NjA5ZTQwOTQzNWMyOTgyY2QiLCJlbWFpbCI6InZpem9yYUB1bmJpYXguY29tIiwiZmlyc3ROYW1lIjoiVml6b3JhIiwibGFzdE5hbWUiOiIgU2FsZXMiLCJpYXQiOjE3NTYzMzg5MzMsImV4cCI6MTc1NjQyNTMzM30.iRY7cXr2kEEcTfkBmzi1d0jTwZssK2RNWGPHLTlLhpQ'}`
        },
        body: JSON.stringify(prospectData),
      });
      
      console.log('MongoDB Response Status:', mongoResponse.status);
      const mongoResponseText = await mongoResponse.text();
      console.log('MongoDB Response Body:', mongoResponseText);
      
      if (emailResponse.ok && mongoResponse.ok) {
        setShowQuiz(false);
        setName('');
        setPhone('');
        setCompany('');
        setEmail('');
        setComment('');
        setIndustria('');
        setQuizAnswers({});
      } else {
        console.error('Email response:', emailResponse.status);
        console.error('MongoDB response:', mongoResponse.status);
        alert('Falló el envío de la encuesta.');
      }
    } catch (error) {
      console.error(error);
      alert('Falló el envío de la encuesta.');
    }
  };
  


  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };


  const handleAnswerChange = (e) => {
    const { name, value, checked } = e.target;
    if (questions[currentQuestion].name === 'q2') {
      // Si es la pregunta 3 y permite selección múltiple
      let updatedAnswers = [...quizAnswers[questions[currentQuestion].name] || []]; // Obtener respuestas anteriores o un array vacío
      if (checked) {
        updatedAnswers.push(value); // Agregar la opción seleccionada
      } else {
        updatedAnswers = updatedAnswers.filter(answer => answer !== value); // Quitar la opción deseleccionada
      }
      setQuizAnswers({ ...quizAnswers, [name]: updatedAnswers }); // Actualizar las respuestas
    } else {
      // Si es una pregunta de opción única
      setQuizAnswers({ ...quizAnswers, [name]: value });
    }
  };

  const handleStartQuiz = (e) => {
    e.preventDefault();
    setIsQuizStarted(true);
    setShowQuiz(true); // Show the quiz section
    setCurrentQuestion(0);
  };

  const handleCloseQuizResultsModal = () => {
    setShowQuizResultsModal(false);
  };
  const handlePrivacyModalOpen = () => {
    setShowPrivacyModal(true);
  };

  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false);
  };

  const handleCheckboxChange = () => {
    setIsPrivacyChecked(!isPrivacyChecked);
  };

  return (
    <div id="contacto" className="newsletter-container animate__animated animate__fadeIn" style={{ backgroundColor: '#033D84', color: 'white' }}>
    <div className='w-full py-16 text-white px-4'>
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 my-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold py-2">¿Qué tan preparado estás para cumplir con la ley?</h1>
            <p className="text-base sm:text-lg md:text-xl py-2">
            Descúbrelo con nuestro diagnóstico en línea completamente gratis
            </p>
          </div>
          <div className="my-4">
         

<button
  onClick={handleContestarEncuestaClick}
 
>
  Diagnostico en Línea
</button>
{showPrivacyModal && <PrivacyPolicyModal onClose={handlePrivacyModalClose} />}

          </div>
 
        </div>
      </div>
      
      {showQuiz && (
        <div className='modal fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50'>
          <div className='modal-content bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative'>
            <span className='close text-black text-2xl cursor-pointer absolute top-4 right-4' onClick={() => setShowQuiz(false)}>&times;</span>
            {!isQuizStarted ? (
              <form onSubmit={handleStartQuiz} className='flex flex-col items-center'>
                <p></p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold py-2 text-center">
                </h2>
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${name ? 'input-orange-border' : ''}`}
                  type='text'
                  placeholder='Nombre'
                  value={name}
                  onChange={handleInputChange(setName)}
                  required
                />
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${email ? 'input-orange-border' : ''}`}
                  type='email'
                  placeholder='Email'
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  required
                />
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${phone ? 'input-orange-border' : ''}`}
                  type='text'
                  placeholder='Teléfono'
                  value={phone}
                  onChange={handleInputChange(setPhone)}
                  required
                />
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${company ? 'input-orange-border' : ''}`}
                  type='text'
                  placeholder='organización'
                  value={company}
                  onChange={handleInputChange(setCompany)}
                />
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${industria ? 'input-orange-border' : ''}`}
                  type='text'
                  placeholder='Industria'
                  value={industria}
                  onChange={handleInputChange(setIndustria)}
                />
                <input
                  className={`p-2 rounded-md text-black mt-2 mb-2 w-full sm:w-auto ${comment ? 'input-orange-border' : ''}`}
                  type='text'
                  placeholder='Mensaje'
                  value={comment}
                  onChange={handleInputChange(setComment)}
                />
                <button type='submit' className='bg-[#00df9a] text-black rounded-md font-medium w-[200px] mx-auto my-4 px-6 py-3'>
                  Continuar
                </button>
              </form>
            ) : (
              <Quiz
                questions={questions}
                currentQuestion={currentQuestion}
                quizAnswers={quizAnswers}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onBack={handleBack}
                onQuizSubmit={handleQuizSubmit}
              />
            )}
          </div>
        </div>
      )}
      {showQuizResultsModal && (
        <QuizResultsModal
          onClose={handleCloseQuizResultsModal}
          obtainedPoints={obtainedPoints}
          totalPoints={totalPoints}
          percentage={percentage}
        />
      )}
    </div>
  );
};


export default Contacto;