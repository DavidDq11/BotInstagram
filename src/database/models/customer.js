const pool = require('../../config/database.js'); // Cambia a require

class Customer {
  static async findByInstagramId(instagramId) {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE instagram_id = $1',
      [instagramId]
    );
    return rows[0];
  }

  static async create(instagramId, state = 'INITIAL') {
    const { rows } = await pool.query(
      'INSERT INTO customers (instagram_id, conversation_state) VALUES ($1, $2) RETURNING *',
      [instagramId, state]
    );
    return rows[0];
  }

  static async updateState(id, state) {
    const { rows } = await pool.query(
      'UPDATE customers SET conversation_state = $1 WHERE id = $2 RETURNING *',
      [state, id]
    );
    return rows[0];
  }
}

module.exports = Customer; // Cambiado a module.exports
