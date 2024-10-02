const axios = require('axios');

const INSTAGRAM_API_URL = 'https://graph.instagram.com/v17.0';

const instagramApi = axios.create({
  baseURL: INSTAGRAM_API_URL,
  params: {
    access_token: process.env.ACCESS_TOKEN
  }
});

async function sendInstagramMessage(recipientId, message) {
  try {
    await instagramApi.post(`/me/messages`, {
      recipient: { id: recipientId },
      message: { text: message }
    });
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

module.exports = { sendInstagramMessage };