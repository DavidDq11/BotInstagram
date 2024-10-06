const instagramService = require('../services/instagramService.js');
const Customer = require('../database/models/customer.js');
const { MESSAGE_TEMPLATES } = require('../utils/messagesTemplates.js');

class CommentHandler {
  async handleComment(commentData) {
    const senderId = commentData.from.id;
    const message = commentData.message;

    // Verifica si el cliente ya existe en la base de datos
    let customer = await Customer.findByInstagramId(senderId);
    if (!customer) {
      customer = await Customer.create(senderId);
    }

    // Manejo de comentarios según el contenido del mensaje
    if (message.toLowerCase().includes('beneficios')) {
      await this.sendBenefits(customer.instagram_id);
    } else if (message.toLowerCase().includes('precio')) {
      await this.sendPrice(customer.instagram_id);
    } else if (message.toLowerCase().includes('pedido')) {
      await this.askForAddress(customer.instagram_id);
    } else {
      await this.handleUnknownComment(customer.instagram_id);
    }
  }

  async sendBenefits(instagramId) {
    await instagramService.sendMessage(instagramId, MESSAGE_TEMPLATES.BENEFITS);
  }

  async sendPrice(instagramId) {
    await instagramService.sendMessage(instagramId, MESSAGE_TEMPLATES.PRICE);
  }

  async askForAddress(instagramId) {
    await instagramService.sendMessage(instagramId, MESSAGE_TEMPLATES.REQUEST_ADDRESS);
  }

  async handleUnknownComment(instagramId) {
    await instagramService.sendMessage(instagramId, "Lo siento, no entendí tu comentario. ¿Te gustaría saber sobre nuestros beneficios o precios?");
  }
}

module.exports = new CommentHandler();
