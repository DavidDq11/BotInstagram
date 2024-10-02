const heatingBeltInfo = require('../components/product/heatingBeltInfo');
const { formatProductMessage } = require('../utils/messageFormatter');
const { sendInstagramMessage } = require('../services/instagramService');

async function handleProductInquiry(senderId, messageText) {
  if (messageText.toLowerCase().includes('precio')) {
    await sendInstagramMessage(senderId, `El precio del ${heatingBeltInfo.name} es $${heatingBeltInfo.price}`);
  } else if (messageText.toLowerCase().includes('beneficios')) {
    await sendInstagramMessage(senderId, `Beneficios del ${heatingBeltInfo.name}:\n${heatingBeltInfo.benefits.join('\n- ')}`);
  } else {
    await sendInstagramMessage(senderId, formatProductMessage(heatingBeltInfo));
  }
}

module.exports = { handleProductInquiry };