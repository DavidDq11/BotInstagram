const Order = require('../database/models/order.js');
const Customer = require('../database/models/customer.js');

class OrderService {
  async createOrder(instagramId, shippingAddress) {
    const customer = await Customer.findByInstagramId(instagramId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return await Order.create(customer.id, shippingAddress);
  }

  async updateOrderStatus(orderId, status) {
    return await Order.updateStatus(orderId, status);
  }
}

module.exports = new OrderService();
