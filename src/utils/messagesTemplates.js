// src/utils/messagesTemplates.js
const MESSAGE_TEMPLATES = {
  INITIAL_RESPONSE: 
    "👋 ¡Hola! Gracias por tu interés en nuestro cinturón terapéutico para alivio de cólicos menstruales. " +
    "¿Te gustaría conocer más sobre sus beneficios? 😊\n\n" +
    "1️⃣ Ver beneficios\n" +
    "2️⃣ Ver precio\n" +
    "3️⃣ Hacer un pedido",
  
  BENEFITS: 
    "✨ Nuestro cinturón terapéutico:\n\n" +
    "🔹 Alivia el dolor en minutos\n" +
    "🔹 Tecnología de calor controlado\n" +
    "🔹 Batería de larga duración\n" +
    "🔹 Discreto y cómodo de usar\n" +
    "🔹 Ajustable a cualquier talla\n\n" +
    "¿Te gustaría hacer un pedido? 🛍️",
  
  PRICE: "💰 El precio de nuestro cinturón terapéutico es de $X. ¡Incluye envío gratuito y pago contra entrega!",
  
  REQUEST_ADDRESS: "¡Excelente elección! 🎉 Para procesar tu pedido, ¿podrías proporcionarme tu dirección de entrega? 📦",
  
  CONFIRM_ORDER: "¡Perfecto! Tu pedido será enviado a: {{ADDRESS}}\n\n¿Confirmamos el pedido? ✅",
  
  ORDER_CONFIRMED: "¡Gracias por tu compra! 🎉 Tu pedido ha sido confirmado y será enviado pronto. Te mantendremos informada sobre el estado de tu envío.",
  
  ORDER_CANCELLED: "Entiendo, he cancelado el pedido. Si cambias de opinión o tienes alguna pregunta, ¡no dudes en escribirme! 😊"
};

const OBJECTION_HANDLING = {
  PRICE: "Entiendo tu preocupación por el precio. Piensa que es una inversión en tu bienestar. Además, ¡ofrecemos pago contra entrega para tu tranquilidad! 💙",
  EFFECTIVENESS: "Nuestro cinturón está respaldado por miles de clientas satisfechas. ¿Te gustaría ver algunos testimonios? 💬"
};

// Exportar usando CommonJS
module.exports = { MESSAGE_TEMPLATES, OBJECTION_HANDLING };
