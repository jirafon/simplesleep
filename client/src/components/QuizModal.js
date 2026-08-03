import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const QuizModal = ({ isOpen, onClose, onComplete, formData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showQuizResultsModal, setShowQuizResultsModal] = useState(false);
  const [obtainedPoints, setObtainedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [quizPercentage, setQuizPercentage] = useState(0);

  // Form data state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [industria, setIndustria] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});

  // Initialize form data from props
  React.useEffect(() => {
    if (formData) {
      setName(formData.name || '');
      setPhone(formData.phone || '');
      setCompany(formData.company || '');
      setEmail(formData.email || '');
      setComment(formData.comment || '');
      setIndustria(formData.industria || '');
    }
  }, [formData]);

  // Function to reset all states
  const resetState = () => {
    setCurrentStep(0);
    setAnswers(Array(questions.length).fill(null));
    setObtainedPoints(0);
    setTotalPoints(0);
    setPercentage(0);
    setShowQuizResultsModal(false);
    setName('');
    setPhone('');
    setCompany('');
    setEmail('');
    setComment('');
    setIndustria('');
    setQuizAnswers({});
  };

    // Function to check if the "Siguiente" button should be disabled
    const isNextButtonDisabled = () => {
      return !answers[currentStep];
    };

     // Function to check if the "Enviar" button should be disabled
  const isSubmitButtonDisabled = () => {
    return !answers[currentStep];
  };


  // Close modal and reset everything
  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleOptionChange = (step, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[step] = questions[step].options[optionIndex].label;
    setAnswers(newAnswers);
    setQuizAnswers(prev => ({
      ...prev,
      [questions[step].name]: questions[step].options[optionIndex].label
    }));
  };

 

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };




  const handleQuizSubmit = async (e) => {
    e.preventDefault();

    // Crear el contenido del correo electrónico
    let emailTemplate = `Hola, llegaron las siguientes respuestas de la encuesta junto con los detalles de contacto:\n\n`;
    emailTemplate += `<p><strong>Nombre:</strong> ${name}</p>`;
    emailTemplate += `<p><strong>Teléfono:</strong> ${phone}</p>`;
    emailTemplate += `<p><strong>organización:</strong> ${company}</p>`;
    emailTemplate += `<p><strong>Industria:</strong> ${industria}</p>`;
    emailTemplate += `<p><strong>Email:</strong> ${email}</p>`;
    emailTemplate += `<p><strong>Mensaje:</strong> ${comment}</p>`;
    emailTemplate += `<br/>Respuestas de la Encuesta:\n\n`;

    // Calcular el total de puntos posibles
    const totalPossiblePoints = questions.reduce((acc, question) => acc + question.points, 0);

    // Calcular los puntos obtenidos
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

    // Calcular el porcentaje de avance
    let calculatedPercentage = ((obtainedPoints / totalPossiblePoints) * 100).toFixed(2);
    emailTemplate += `<p>Su resultado es ${obtainedPoints} puntos, de un total de ${totalPossiblePoints}. El % de avance es de ${calculatedPercentage}%.</p>`;
    setQuizPercentage(calculatedPercentage);
    onComplete(calculatedPercentage);
    // Mostrar el modal de resultados del cuestionario
    setShowQuizResultsModal(true);
    setObtainedPoints(obtainedPoints);
    setTotalPoints(totalPossiblePoints);

    try {
      // Delay de 5 segundos para despertar el servidor de Render
      console.log('Iniciando delay de 5 segundos para despertar el servidor...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Servidor despierto, enviando email...');
      
      // Enviar el correo electrónico
      const apiBaseUrl = process.env.REACT_APP_BASE_URL || 'https://siempresalud-server.onrender.com';
      const response = await fetch(`${apiBaseUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: ['contacto@unbiax.com'],
          emailTemplate,
          subject: 'Respuestas de la Encuesta recibida',
        }),
      });

      if (response.ok) {
        // Limpiar los estados y ocultar el cuestionario
        resetState();
        onClose();
      } else {
        alert('Falló el envío de la encuesta.');
      }
    } catch (error) {
      console.error(error);
      alert('Falló el envío de la encuesta.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200'
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <h2 className='text-3xl font-bold mb-6 text-center'>Diagnóstico de Unbiax</h2>
        <form className='space-y-4' onSubmit={handleQuizSubmit}>
          <div>
            <h3 className='text-lg font-medium mb-4'>{questions[currentStep].question}</h3>
            {questions[currentStep].options.map((option, index) => (
              <div key={index} className='flex items-center mb-2'>
                <input
                  type='radio'
                  id={`option-${currentStep}-${index}`}
                  name={`question-${currentStep}`}
                  value={option.label}
                  checked={answers[currentStep] === option.label}
                  onChange={() => handleOptionChange(currentStep, index)}
                  className='form-radio'
                  aria-labelledby={`option-${currentStep}-${index}`}
                />
                <label htmlFor={`option-${currentStep}-${index}`} className='ml-2'>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <div className='flex justify-between mt-4'>
            {currentStep > 0 && (
              <button
                type='button'
                onClick={handlePrevStep}
                className='bg-white text-blue-500 border border-black p-2 rounded-md flex items-center'
                style={{ marginRight: '10px' }}
                aria-label="Previous Step"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span style={{ marginLeft: '10px' }}>Anterior</span>
              </button>
            )}
            {currentStep < questions.length - 1 && (
              <button
                type='button'
                onClick={handleNextStep}
                className={`bg-[rgb(43,71,146)] text-white p-2 rounded-md ${isNextButtonDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isNextButtonDisabled()}
                aria-label="Next Step"
              >
                <span className='mr-2'>Siguiente</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            )}
            {currentStep === questions.length - 1 && (
              <button
                type='submit'
                className={`bg-[rgb(43,71,146)] text-white p-2 rounded-md ${isSubmitButtonDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Submit"
                disabled={isSubmitButtonDisabled()}

              >
                Enviar
              </button>
            )}
          </div>
        </form>
        
      </div>
    </div>
  );
};

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
    points: 5
  },
  {
    question: '¿Tiene algunos de estos procedimientos que tengan un control real, escrito y efectivo, que cuentan con evidencia demostrable en todo momento y trazable para hacer seguimiento? Seleccione todas las que apliquen',
    options: [
      { label: 'Registros de reuniones', points: 2 },
      { label: 'Declaraciones de conflictos de interés', points: 2 },
      { label: 'Declaraciones de transferencias de valor', points: 2 },
      { label: 'Control de lectura de documentos', points: 2 },
      { label: 'Canal de denuncia anónima', points: 2 },
      { label: 'Campaña comunicacional', points: 1 }
    ],
    name: 'q2',
    points: 6
  },
  {
    question: '¿Cuáles de los siguientes tipos de capacitaciones ofrece su organización a sus empleados? Seleccione todas las que apliquen',
    options: [
      { label: 'Capacitación en ética y compliance', points: 2 },
      { label: 'Capacitación en prevención de lavado de dinero', points: 2 },
      { label: 'Capacitación en prevención de corrupción', points: 2 },
      { label: 'Capacitación en protección de datos', points: 2 },
      { label: 'Capacitación en ciberseguridad', points: 1 }
    ],
    name: 'q3',
    points: 8
  },
  {
    question: '¿Cuál es el estado actual del cumplimiento de políticas en los diferentes departamentos?',
    options: [
      { label: 'Sí, tenemos un Oficial de Cumplimiento designado', points: 3 },
      { label: 'Estamos en proceso de designación', points: 2 },
      { label: 'No, no hemos designado a nadie', points: 1 }
    ],
    name: 'q4',
    points: 3
  }
];

export default QuizModal;