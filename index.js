// index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { handleProductInquiry } = require('./handlers/productHandler');
const { presentHeatingBelt } = require('./scenes/heatingBeltScene');
const { processOrder } = require('./services/orderService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Instagram API base URL
const INSTAGRAM_API_URL = 'https://graph.instagram.com/v17.0';

// Instagram API client
const instagramApi = axios.create({
  baseURL: INSTAGRAM_API_URL,
  params: {
    access_token: process.env.ACCESS_TOKEN
  }
});

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.send('Instagram Bot is running!');
});

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('Webhook verification failed');
      res.sendStatus(403);
    }
  } else {
    console.error('Missing mode or token');
    res.sendStatus(400);
  }
});

// Webhook event handling endpoint
app.post('/webhook', async (req, res) => {
  const body = req.body;

  try {
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        if (entry.messaging) {
          await handleInstagramMessage(entry.messaging[0]);
        } else if (entry.changes) {
          await handleInstagramChanges(entry.changes[0]);
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      console.warn(`Received unknown object: ${body.object}`);
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

async function handleInstagramMessage(webhookEvent) {
  console.log('New Instagram message:', webhookEvent);
  
  const senderId = webhookEvent.sender.id;
  const messageText = webhookEvent.message.text.toLowerCase();

  try {
    if (messageText.includes('cinturón') || messageText.includes('calentador')) {
      await presentHeatingBelt(senderId);
    } else if (messageText.includes('comprar')) {
      await processOrder(senderId, 'heating-belt');
    } else {
      await handleProductInquiry(senderId, messageText);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

async function handleInstagramChanges(change) {
  console.log('Instagram account change:', change);
  // Implement logic for handling various Instagram changes
}

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});