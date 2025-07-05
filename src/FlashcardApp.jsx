import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TRANSLATIONS = {
  "pt-BR": {
    "createFlashcardsTitle": "Criar flashcards",
    "pasteTextTab": "Colar texto",
    "describeTopicTab": "Descrever tópico",
    "describeTopicPlaceholder": "Descreva um tópico e o Gemini gerará os detalhes...\n\nex. capitais do mundo\nex. curiosidades sobre o Rio de Janeiro",
    "pasteTextPlaceholder": "Cole seu texto aqui...",
    "generateFlashcardsButton": "Gerar flashcards",
    "generatingTitle": "Gerando seu conjunto de flashcards...",
    "generatingSubtitle": "Isso pode levar um tempo dependendo do conteúdo...",
    "flipInstruction": "Use as setas ↑↓ ou clique para virar",
    "createNewFlashcardsLink": "Criar novos flashcards",
    "flowlabBrand": "Um produto FlowLab"
  },
  "en-US": {
    "createFlashcardsTitle": "Create flashcards",
    "pasteTextTab": "Paste text",
    "describeTopicTab": "Describe topic",
    "describeTopicPlaceholder": "Describe a topic Gemini will generate the details...\n\ne.g. capitals of the world\ne.g. fun facts about San Diego",
    "pasteTextPlaceholder": "Paste your text here...",
    "generateFlashcardsButton": "Generate flashcards",
    "generatingTitle": "Generating your flashcard set...",
    "generatingSubtitle": "This may take a while depending on the upload...",
    "flipInstruction": "Use ↑↓ arrows or click to flip",
    "createNewFlashcardsLink": "Create new flashcards",
    "flowlabBrand": "A FlowLab product"
  }
};

const locale = 'pt-BR';
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const FlashcardApp = () => {
  const [mode, setMode] = useState('create'); // 'create', 'loading', 'study'
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState('describe');
  const [animating, setAnimating] = useState(false);

  const generateFlashcards = async () => {
    if (!topic.trim()) return;

    setMode('loading');

    let prompt;
    if (activeTab === 'paste') {
      prompt = `Você tem a tarefa de extrair conteúdo de flashcard de um determinado trecho de texto. Seu objetivo é identificar termos-chave e suas definições ou explicações correspondentes que seriam adequadas para a criação de flashcards.
Aqui está o trecho de texto que você precisa analisar:
<text_chunk>${topic}</text_chunk>
Diretrizes para extração de conteúdo de flashcard:
1. Identifique termos, conceitos ou frases importantes que são centrais para o tópico do texto.
2. Para cada termo, encontre uma definição, explicação ou informação chave correspondente no texto.
3. Certifique-se de que os pares de termo e definição sejam concisos e claros.
4. Extraia apenas as informações mais relevantes e significativas.
5. Busque um equilíbrio entre abrangência e brevidade.
Crie entre 3 e 10 flashcards com base no conteúdo disponível.
Por favor, responda em português do Brasil.
Responda APENAS com um array JSON válido neste formato exato:
[
  {
    "front": "Termo ou conceito (mantenha conciso, ideal 1-5 palavras)",
    "back": "Definição ou explicação do texto (clara e educativa, menos de 50 palavras)"
  }
]
NÃO inclua nenhum texto fora do array JSON.`;
    } else {
      prompt = `Você tem a tarefa de criar flashcards educacionais sobre "${topic}". Seu objetivo é criar pares de flashcards concisos, claros e precisos que ajudariam alguém a aprender este tópico.
Diretrizes para a criação de flashcards eficazes:
1. Cada flashcard deve ter um termo/conceito claro de um lado e uma definição/explicação concisa do outro.
2. Os termos devem ser específicos e focados (idealmente 1-5 palavras).
3. As definições devem ser claras e breves (idealmente menos de 50 palavras).
4. Concentre-se nos conceitos mais importantes relacionados ao tópico.
5. Torne o conteúdo educacional, preciso e útil para o aprendizado.
Com base no tópico, adapte sua abordagem:
* Para locais (países, cidades): Use o local como termo e fatos importantes como definição.
* Para assuntos históricos: Use eventos/pessoas como termos e datas/significado como definições.
* Para tópicos científicos: Use conceitos/termos como a frente e explicações como o verso.
* Para aprendizado de idiomas: Use palavras em um idioma como termos e traduções como definições.
Por favor, responda em português do Brasil.
Forneça exatamente 10 flashcards neste formato JSON - não inclua nenhum texto fora do JSON:
[
  {
    "front": "Termo ou conceito",
    "back": "Definição ou explicação"
  }
]`;
    }

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        let text = result.candidates[0].content.parts[0].text;
        // Remove markdown code block wrappers if they exist
        text = text.replace(/```json\n?|\n?```/g, '');
        const cards = JSON.parse(text);
        setFlashcards(cards);
        setCurrentIndex(0);
        setFlipped(false);
        setMode('study');
      } else {
        console.error('Estrutura de resposta inesperada ou conteúdo ausente:', result);
        alert('Falha ao gerar flashcards. Por favor, tente novamente.');
        setMode('create');
      }
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      alert('Falha ao gerar flashcards. Por favor, tente novamente.');
      setMode('create');
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setFlipped(false);
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => setAnimating(false), 50);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setFlipped(false);
        setCurrentIndex(currentIndex - 1);
        setTimeout(() => setAnimating(false), 50);
      }, 150);
    }
  };

  const handleKeyPress = (e) => {
    if (mode === 'study') {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, currentIndex, flashcards.length, flipped, animating]);

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-white text-4xl font-bold mb-2">{t('createFlashcardsTitle')}</h1>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full inline-flex shadow-lg">
              <button
                onClick={() => setActiveTab('paste')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all text-base ${
                  activeTab === 'paste'
                    ? 'bg-white text-gray-700 shadow-md'
                    : 'text-white hover:text-white/90'
                }`}
              >
                {t('pasteTextTab')}
              </button>
              <button
                onClick={() => setActiveTab('describe')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all text-base ${
                  activeTab === 'describe'
                    ? 'bg-white text-gray-700 shadow-md'
                    : 'text-white hover:text-white/90'
                }`}
              >
                {t('describeTopicTab')}
              </button>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={activeTab === 'describe'
                ? t('describeTopicPlaceholder')
                : t('pasteTextPlaceholder')}
              className="w-full h-52 text-gray-900 placeholder-gray-400 resize-none focus:outline-none bg-transparent"
              style={{ fontSize: '18px', lineHeight: '1.6' }}
            />
          </div>

          <button
            onClick={generateFlashcards}
            className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-full hover:from-purple-700 hover:to-pink-600 transition-all text-lg shadow-lg transform hover:scale-105 hover:shadow-xl"
          >
            {t('generateFlashcardsButton')}
          </button>

          <div className="text-center mt-8">
            <p className="text-white/70 text-sm font-medium">{t('flowlabBrand')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h1 className="text-white text-4xl font-medium mb-4">{t('generatingTitle')}</h1>
          <p className="text-white/80 mb-8">{t('generatingSubtitle')}</p>
          <div className="text-center mt-8">
            <p className="text-white/70 text-sm font-medium">{t('flowlabBrand')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'study') {
    const currentCard = flashcards[currentIndex];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="w-full max-w-2xl px-8">
          <div className="relative" style={{ perspective: '1000px' }}>
            <div
              className={`relative w-full h-96 transition-all duration-700 transform-style-preserve-3d cursor-pointer ${
                flipped ? 'rotate-x-180' : ''
              } ${animating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
              onClick={handleFlip}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Frente do cartão */}
              <div
                className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-center flex-1 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {currentCard.front}
                  </h2>
                </div>
                <p className="text-gray-500 mt-auto text-sm font-medium">{t('flipInstruction')}</p>
              </div>

              {/* Verso do cartão */}
              <div
                className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center p-8 rotate-x-180 backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)'
                }}
              >
                <div className="text-center">
                  <p className="text-xl text-gray-700 leading-relaxed font-medium">{currentCard.back}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-all ${
                currentIndex === 0
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:scale-110'
              }`}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="mx-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-white text-lg font-bold">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className={`p-3 rounded-full transition-all ${
                currentIndex === flashcards.length - 1
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:scale-110'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setMode('create');
                setTopic('');
                setFlashcards([]);
              }}
              className="text-white/80 hover:text-white transition-colors underline-offset-2 hover:underline font-medium mb-4"
            >
              {t('createNewFlashcardsLink')}
            </button>
            <p className="text-white/70 text-sm font-medium">{t('flowlabBrand')}</p>
          </div>
        </div>
      </div>
    );
  }
};

// Adiciona CSS para animação de virada 3D
const style = document.createElement('style');
style.textContent = `
  .rotate-x-180 {
    transform: rotateX(180deg);
  }
  .backface-hidden {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  @keyframes slideInFromRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideInFromLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default FlashcardApp;