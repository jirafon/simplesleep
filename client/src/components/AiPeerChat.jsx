import React, { useState } from "react";
import { motion } from "framer-motion";

export default function AiPeerChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hola, soy Automatix - Ai Peer 👋 ¿Sobre qué área deseas ayuda hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: generateResponse(input) }
      ]);
    }, 1200);
    
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const generateResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes("riesgo") || q.includes("risk")) {
      return "He identificado 3 riesgos activos en tu matriz ESG:\n• Riesgo operacional (Alto)\n• Cumplimiento regulatorio (Medio)\n• Seguridad de datos (Alto)\n\n¿Deseas ver el plan de mitigación?";
    }
    
    if (q.includes("cumplimiento") || q.includes("compliance")) {
      return "Tu índice de cumplimiento está en 92%. Hay 2 brechas en revisión:\n• Actualización de políticas de privacidad (pendiente)\n• Capacitación en ética corporativa (en curso)\n\nPuedo generar un reporte detallado.";
    }
    
    if (q.includes("datos") || q.includes("data") || q.includes("privacidad")) {
      return "Privax monitorea tus datos personales activamente:\n• 127 bases de datos registradas\n• 1 contrato con riesgo medio detectado\n• 98% de cumplimiento RGPD\n\n¿Necesitas el análisis de impacto?";
    }
    
    if (q.includes("mpd") || q.includes("delito") || q.includes("etica")) {
      return "EticPro registra 5 flujos activos del modelo de prevención del delito:\n• Canal de denuncias: 2 casos abiertos\n• Due diligence proveedores: 3 en revisión\n• Capacitaciones: 95% completitud\n\n¿Quieres ver el dashboard?";
    }
    
    if (q.includes("esg") || q.includes("ambiental") || q.includes("sostenibilidad")) {
      return "SmartRisk muestra tu desempeño ESG:\n• Environmental: 87%\n• Social: 91%\n• Governance: 93%\n\nHay 2 indicadores ambientales que requieren atención. ¿Los reviso?";
    }
    
    if (q.includes("hola") || q.includes("hi") || q.includes("hey")) {
      return "¡Hola! 👋 Estoy aquí para ayudarte con:\n• Gestión de riesgos\n• Cumplimiento normativo\n• Protección de datos\n• Modelo de prevención del delito\n• ESG y sostenibilidad\n\n¿Qué te gustaría revisar?";
    }
    
    return "Puedo ayudarte con:\n• 📊 Gestión de riesgos y matrices\n• ⚖️ Cumplimiento y normativas\n• 🔒 Protección de datos personales\n• 🛡️ Modelo de prevención del delito (MPD)\n• 🌱 Indicadores ESG\n\n¿Sobre qué área deseas información?";
  };

  const quickActions = [
    { icon: "📊", text: "Ver riesgos", query: "riesgos" },
    { icon: "⚖️", text: "Cumplimiento", query: "cumplimiento" },
    { icon: "🔒", text: "Datos", query: "datos" },
    { icon: "🌱", text: "ESG", query: "esg" }
  ];

  const handleQuickAction = (query) => {
    setInput(query);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 shadow-2xl"
      >
        {/* Chat Box */}
        <div className="h-96 overflow-y-auto mb-6 space-y-4 scroll-smooth">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white'
              } shadow-lg`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-5 py-3 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-4 flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.query)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">{action.icon}</span>
              {action.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta sobre riesgos, cumplimiento, datos..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Enviar
          </button>
        </div>

        {/* Info */}
        <p className="text-gray-500 text-xs mt-4 text-center">
          Este es un demo simulado. Automatix - Ai Peer real se conecta a tus datos y módulos Unbiax.
        </p>
      </motion.div>
    </div>
  );
}
