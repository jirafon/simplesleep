// ChatbotConfig.js
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: 'SalesBot',
  initialMessages: [createChatBotMessage('Hola! ¿En qué puedo ayudarte?')],
};

export default config;
