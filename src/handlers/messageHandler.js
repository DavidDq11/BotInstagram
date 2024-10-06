const Customer = require('../database/models/customer.js');
const messengerService = require('../services/messengerService.js');
const orderService = require('../services/orderService.js');
const { MESSAGE_TEMPLATES } = require('../utils/messagesTemplates.js');

class MessageHandler {
  async handleMessage(messaging) {
    const senderId = messaging.sender.id;
    const message = messaging.message.text;

    let customer = await Customer.findByInstagramId(senderId);
    if (!customer) {
      customer = await Customer.create(senderId);
    }

    switch (customer.conversation_state) {
      case 'INITIAL':
        return this.handleInitialState(customer, message);
      case 'AWAITING_ADDRESS':
        return this.handleAddressInput(customer, message);
      case 'CONFIRMING_ORDER':
        return this.handleOrderConfirmation(customer, message);
      default:
        return this.handleUnknownState(customer);
    }
  }

  async handleInitialState(customer, message) {
    await messengerService.sendMessage(customer.instagram_id, MESSAGE_TEMPLATES.INITIAL_RESPONSE);
    await Customer.updateState(customer.id, 'AWAITING_RESPONSE');
  }

  async handleAddressInput(customer, message) {
    // Guardar dirección y pedir confirmación
    await orderService.createOrder(customer.instagram_id, message);
    const confirmMessage = MESSAGE_TEMPLATES.CONFIRM_ORDER.replace('{{ADDRESS}}', message);
    await messengerService.sendMessage(customer.instagram_id, confirmMessage);
    await Customer.updateState(customer.id, 'CONFIRMING_ORDER');
  }

  async handleOrderConfirmation(customer, message) {
    if (message.toLowerCase().includes('sí') || message.toLowerCase().includes('si')) {
      await messengerService.sendMessage(customer.instagram_id, MESSAGE_TEMPLATES.ORDER_CONFIRMED);
      await Customer.updateState(customer.id, 'COMPLETED');
    } else {
      await messengerService.sendMessage(customer.instagram_id, MESSAGE_TEMPLATES.ORDER_CANCELLED);
      await Customer.updateState(customer.id, 'INITIAL');
    }
  }
}

module.exports = new MessageHandler();
