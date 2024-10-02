const heatingBeltInfo = require('../components/product/heatingBeltInfo');
const { sendInstagramMessage } = require('../services/instagramService');

async function presentHeatingBelt(senderId) {
  await sendInstagramMessage(senderId, `¡Descubre nuestro ${heatingBeltInfo.name}!`);
  await sendInstagramMessage(senderId, heatingBeltInfo.description);
  await sendInstagramMessage(senderId, `Precio: $${heatingBeltInfo.price}`);
  // Aquí podrías añadir lógica para enviar una imagen del producto si Instagram lo permite
}

module.exports = { presentHeatingBelt };