const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const callSendAPI = async (recipientId, message) => {
    const requestBody = {
        recipient: {
            id: recipientId,
        },
        message: message,
    };

    try {
        await axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, requestBody);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

module.exports = { callSendAPI };
