const OpenAI = require('openai');

// Initialize OpenAI client - will be set when function is called
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPEN_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPEN_API_KEY no está configurada en las variables de entorno');
    }
    console.log('🔑 Initializing OpenAI client with OPEN_API_KEY:', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));
    openai = new OpenAI({
      apiKey: apiKey
    });
  }
  return openai;
}

/**
 * Analyze patient records using AI
 * @param {Array} orders - Array of Order documents
 * @returns {Promise<String>} AI analysis response
 */
async function analyzePatientRecords(orders) {
  if (!process.env.OPEN_API_KEY) {
    throw new Error('OPEN_API_KEY no está configurada en las variables de entorno');
  }

  // Validate API key format (OpenAI keys typically start with 'sk-')
  const apiKey = process.env.OPEN_API_KEY.trim();
  console.log('🔍 Using OPEN_API_KEY:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ OPEN_API_KEY no es una API key válida de OpenAI. Debe comenzar con "sk-"');
    console.error('❌ Valor actual comienza con:', apiKey.substring(0, 4));
    throw new Error('OPEN_API_KEY no es una API key válida de OpenAI. Debe comenzar con "sk-". Verifica tu archivo .env');
  }

  // Format orders data for the prompt
  const formattedRecords = orders.map((order, index) => {
    const user = order.userId || {};
    const exams = Array.isArray(order.exams) && order.exams.length > 0 
      ? order.exams.join(', ') 
      : order.examName || 'N/A';
    
    return `
Registro #${index + 1}:
- Paciente: ${user.name || 'N/A'} (${user.email || 'N/A'})
- Fecha: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CL') : 'N/A'}
- Exámenes solicitados: ${exams}
- Tipo de examen: ${order.type || 'N/A'}
- Estado: ${order.status || 'N/A'}
- Médico: ${order.doctorName || 'N/A'}
- Notas: ${order.notes || 'Sin notas'}
- Fecha de aprobación: ${order.approvedAt ? new Date(order.approvedAt).toLocaleDateString('es-CL') : 'No aprobada'}
${user.dateOfBirth ? `- Fecha de nacimiento: ${new Date(user.dateOfBirth).toLocaleDateString('es-CL')}` : ''}
${user.gender ? `- Género: ${user.gender}` : ''}
`;
  }).join('\n---\n');

  const prompt = `Eres un médico experto analizando registros médicos de pacientes. Analiza los siguientes registros médicos y proporciona:

1. **Análisis General**: Resumen de los registros del paciente
2. **Posibles Diagnósticos**: Basado en los exámenes solicitados, ¿qué condiciones médicas podrían estar siendo evaluadas?
3. **Tratamientos Sugeridos**: ¿Qué tratamientos o seguimientos se recomiendan?
4. **Señales de Alerta**: ¿Hay algo que se vea preocupante o requiera atención inmediata?
5. **Recomendaciones**: ¿Qué más se puede hacer? ¿Hay exámenes adicionales que deberían considerarse?
6. **Observaciones Clínicas**: Notas importantes para el médico tratante

IMPORTANTE: 
- Sé profesional y preciso
- No proporciones diagnósticos definitivos sin más información clínica
- Enfócate en análisis basado en los exámenes solicitados
- Proporciona recomendaciones prácticas y útiles para el médico

Registros del paciente:
${formattedRecords}

Por favor, proporciona un análisis completo y estructurado en español.`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un médico experto que analiza registros médicos y proporciona análisis clínicos profesionales, diagnósticos sugeridos, tratamientos recomendados y observaciones importantes para el médico tratante.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Error al analizar con IA: ${error.message}`);
  }
}

module.exports = {
  analyzePatientRecords
};
