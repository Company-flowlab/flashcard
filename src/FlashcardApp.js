import React, { useState } from 'react';

const FlashcardApp = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setFlashcards([
        { question: `O que é ${topic}?`, answer: `Explicação curta sobre ${topic}.` },
        { question: `Como funciona ${topic}?`, answer: `Funciona assim e assado.` }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-700 text-white px-4">
      <div className="max-w-xl w-full bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-6">🎓 Criar flashcards</h1>
        <div className="flex justify-center gap-4 mb-6">
          <button className="bg-white/20 px-4 py-2 rounded-full text-white border border-white hover:bg-white hover:text-pink-600 transition">
            Colar texto
          </button>
          <button className="bg-white/20 px-4 py-2 rounded-full text-white border border-white hover:bg-white hover:text-pink-600 transition">
            Descrever tópico
          </button>
        </div>

        <input
          type="text"
          placeholder="Digite um tópico (ex: artigo 53 da CRFB)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded text-gray-800"
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-2 rounded text-white font-semibold shadow hover:opacity-90 transition"
        >
          {loading ? 'Gerando...' : 'Gerar flashcards'}
        </button>

        {flashcards.length > 0 && (
          <div className="mt-8 space-y-4 text-left">
            {flashcards.map((card, idx) => (
              <div key={idx} className="bg-white/40 rounded p-4">
                <h3 className="font-bold">{card.question}</h3>
                <p>{card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-white/70">Um produto FlowLab</p>
    </div>
  );
};

export default FlashcardApp;