const { sendInstagramMessage } = require('./instagramService');

async function processOrder(senderId, productId) {
  // Aquí iría la lógica real de procesamiento de pedidos
  console.log(`Procesando orden para el producto ${productId} del usuario ${senderId}`);
  
  // Simulación de procesamiento de pedido
  await sendInstagramMessage(senderId, "¡Gracias por tu pedido! Estamos procesándolo.");
  // Más lógica de procesamiento...
  
  await sendInstagramMessage(senderId, "Tu pedido ha sido confirmado. Te enviaremos los detalles de envío pronto.");
}

module.exports = { processOrder };