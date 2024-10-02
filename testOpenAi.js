require('dotenv').config();
const OpenAI = require("openai");

// Crea la configuración
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Asegúrate de usar el modelo correcto
      messages: [{ role: "user", content: "Hello, how are you?" }],
    });
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

testOpenAI();
