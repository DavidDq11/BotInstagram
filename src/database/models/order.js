const pool = require('../../config/database.js');

class Order {
  static async create(customerId, shippingAddress) {
    const { rows } = await pool.query(
      'INSERT INTO orders (customer_id, shipping_address, status) VALUES ($1, $2, $3) RETURNING *',
      [customerId, shippingAddress, 'PENDING']
    );
    return rows[0];
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  }
}

module.exports = Order;
