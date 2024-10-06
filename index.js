const express = require('express');
const dotenv = require('dotenv');
const messageHandler = require('./src/handlers/messageHandler.js');
const commentHandler = require('./src/handlers/commentHandler.js'); // Opcional, si también manejarás comentarios

dotenv.config();

const app = express();
app.use(express.json());

// Ruta de verificación del webhook de Messenger
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Ruta para manejar los eventos del webhook de Messenger
app.post('/webhook', async (req, res) => {
  const { body } = req;

  if (body.object === 'page') { // Messenger usa "page"
    for (const entry of body.entry) {
      if (entry.messaging) {
        for (const messaging of entry.messaging) {
          await messageHandler.handleMessage(messaging); // Maneja los mensajes de Messenger
        }
      }
      if (entry.changes) {
        for (const change of entry.changes) {
          await commentHandler.handleComment(change); // Opcional para manejar comentarios
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Ruta de verificación del estado de la app
app.get('/', (req, res) => {
  res.send('Messenger Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
