// Importa as bibliotecas necessárias para interagir com a API do Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  // Log para verificar se o prompt foi recebido
  console.log('Prompt recebido na função serverless:', prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  // Log para verificar se a API Key está a ser lida (apenas o comprimento, por segurança)
  console.log('Comprimento da API Key (se definida):', apiKey ? apiKey.length : 'undefined');

  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              "front": { "type": "STRING" },
              "back": { "type": "STRING" }
            },
            "propertyOrdering": ["front", "back"]
          }
        }
      }
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    let cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '');

    const flashcards = JSON.parse(cleanJsonString);

    res.status(200).json(flashcards);
  } catch (error) {
    console.error('Erro na API Gemini da função serverless:', error);
    res.status(500).json({ error: 'Failed to generate flashcards from API.', details: error.message });
  }
}