const axios = require('axios'); // Cambiar a require
const dotenv = require('dotenv'); // Cambiar a require

dotenv.config();

class InstagramService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://graph.facebook.com/v17.0',
      params: {
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    });
  }

  async sendMessage(recipientId, message) {
    try {
      await this.api.post(`/me/messages`, {
        recipient: { id: recipientId },
        message: { text: message },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

module.exports = new InstagramService(); // Cambiar a module.exports
