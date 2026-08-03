import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Crear un nuevo mensaje con la entrada del usuario
    const newMessage = {
      text: input,
      sender: 'user', // Puedes distinguir entre mensajes de usuario y respuestas del bot
    };

    // Actualizar el estado de mensajes
    setMessages([...messages, newMessage]);

    // Lógica para respuesta del chatbot (simulado)
    simulateChatbotResponse(input);

    // Limpiar el campo de entrada
    setInput('');
  };

  const simulateChatbotResponse = (userInput) => {
    // Aquí puedes implementar la lógica para generar una respuesta del chatbot
    // Por ejemplo, puedes tener respuestas predefinidas o usar inteligencia artificial para respuestas más avanzadas
    const botResponse = {
      text: `Gracias por tu mensaje: "${userInput}". Estamos revisando tu consulta.`,
      sender: 'bot',
    };

    // Simular una respuesta después de un tiempo de espera
    setTimeout(() => {
      setMessages([...messages, botResponse]);
    }, 500);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px' }}>
      <h2>Chat de Ventas</h2>
      <div style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{message.sender === 'user' ? 'Tú' : 'Bot'}</strong>: {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ width: 'calc(100% - 80px)', padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Chat;
