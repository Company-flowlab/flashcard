// Importa as bibliotecas necessárias para interagir com a API do Google Gemini
// Note: Esta função será executada em um ambiente Node.js no Vercel.
// As bibliotecas do Google AI Studio (como @google/generative-ai)
// são ideais para uso em backends Node.js.
import { GoogleGenerativeAI } from '@google/generative-ai';

// Esta é a função principal que será executada quando o endpoint /api/generate-flashcards for acessado.
// Ela recebe dois argumentos: 'req' (requisição) e 'res' (resposta).
export default async function handler(req, res) {
  // Verifica se o método da requisição é POST.
  // Apenas requisições POST são esperadas para gerar flashcards.
  if (req.method !== 'POST') {
    // Se não for POST, retorna um erro 405 (Método Não Permitido).
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extrai o 'prompt' do corpo da requisição.
  // O frontend enviará o texto ou tópico que o Gemini deve usar.
  const { prompt } = req.body;

  // Verifica se o prompt foi fornecido.
  if (!prompt) {
    // Se o prompt estiver faltando, retorna um erro 400 (Requisição Inválida).
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Acessa a chave de API do Gemini a partir das variáveis de ambiente do Vercel.
  // A variável de ambiente 'GOOGLE_API_KEY' foi configurada por você no painel do Vercel.
  // É CRUCIAL que esta chave NUNCA seja exposta no código do frontend.
  const apiKey = process.env.GOOGLE_API_KEY;

  // Verifica se a chave de API está disponível.
  if (!apiKey) {
    // Se a chave não estiver configurada, retorna um erro 500 (Erro Interno do Servidor).
    console.error('GOOGLE_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  try {
    // Inicializa o cliente da API do Google Gemini com a chave de API.
    const genAI = new GoogleGenerativeAI(apiKey);
    // Seleciona o modelo 'gemini-2.0-flash'.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Inicia um chat com o modelo (pode ser usado para manter o histórico, mas aqui é uma única chamada).
    const chat = model.startChat({
      history: [], // Começa com histórico vazio para cada nova requisição
      generationConfig: {
        responseMimeType: "application/json", // Solicita resposta em JSON
        responseSchema: { // Define o esquema JSON esperado
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

    // Envia o prompt para o modelo Gemini.
    const result = await chat.sendMessage(prompt);
    // Extrai a resposta de texto do resultado.
    const responseText = result.response.text();

    // O Gemini pode retornar o JSON dentro de blocos de código Markdown (```json ... ```).
    // Removemos esses blocos para garantir que seja um JSON puro.
    let cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '');

    // Faz o parse da string JSON para um objeto JavaScript.
    const flashcards = JSON.parse(cleanJsonString);

    // Retorna os flashcards gerados como resposta JSON para o frontend.
    res.status(200).json(flashcards);
  } catch (error) {
    // Captura e loga quaisquer erros que ocorram durante a chamada da API ou processamento.
    console.error('Error calling Gemini API from serverless function:', error);
    // Retorna um erro 500 para o frontend em caso de falha.
    res.status(500).json({ error: 'Failed to generate flashcards from API.', details: error.message });
  }
}