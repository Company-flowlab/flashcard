// Arquivo: /api/gemini.js
// Crie este arquivo na pasta /api/ do seu projeto

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    // A API key vai funcionar aqui no servidor
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('API Key não encontrada');
      return res.status(500).json({ error: 'API Key não configurada' });
    }

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      
      let text = result.candidates[0].content.parts[0].text;
      text = text.replace(/```json\n?|\n?```/g, '');
      
      try {
        const cards = JSON.parse(text);
        return res.status(200).json({ success: true, flashcards: cards });
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        return res.status(500).json({ error: 'Resposta da API em formato inválido' });
      }
    } else {
      console.error('Estrutura de resposta inesperada:', result);
      return res.status(500).json({ error: 'Resposta inesperada da API Gemini' });
    }

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: error.message });
  }
}