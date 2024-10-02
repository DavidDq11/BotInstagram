const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5434;

app.use(bodyParser.json());

// Ruta para la verificación del webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verificado correctamente');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Ruta para recibir eventos de webhook
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Verifica que sea un evento de Instagram
  if (body.object === 'instagram') {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Aquí puedes manejar el evento, por ejemplo, un mensaje directo
      // Implementa la lógica de tu bot aquí

    });

    // Envía una respuesta 200 para indicar que recibiste el evento
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
