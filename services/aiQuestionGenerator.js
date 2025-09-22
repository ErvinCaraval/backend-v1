const axios = require('axios');

class AIQuestionGenerator {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.openAiApiKey = process.env.OPENAI_API_KEY || '';
    this.groqURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.openAiURL = 'https://api.openai.com/v1/chat/completions';
    // Model por defecto en Groq (rápido y gratuito con cuota)
    this.groqModel = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
    // Respaldo OpenAI si existiese
    this.openAiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  // Extrae JSON de respuestas que puedan venir con ``` o texto adicional
  extractJson(content) {
    if (!content) return null;
    // Elimina fences tipo ```json ... ```
    let cleaned = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    // Si aún no es JSON puro, intenta localizar el primer objeto
    if (!(cleaned.startsWith('{') && cleaned.endsWith('}'))) {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }
    }
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  // Generar preguntas usando IA (Groq por defecto)
  async generateQuestions(topic, difficulty = 'medium', count = 5) {
    try {
      const prompt = this.buildPrompt(topic, difficulty, count);
      let questions = [];

      if (!this.groqApiKey && !this.openAiApiKey) {
        throw new Error('No se encontró ninguna API key de IA. Por favor configura GROQ_API_KEY o OPENAI_API_KEY en tu archivo .env.');
      }

      // Preferir Groq si hay API key
      if (this.groqApiKey) {
        try {
          const response = await axios.post(this.groqURL, {
            model: this.groqModel,
            messages: [
              { role: 'system', content: 'Eres un experto en crear preguntas de trivia educativas y entretenidas. Responde siempre en formato JSON válido.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
          }, {
            headers: {
              'Authorization': `Bearer ${this.groqApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          const content = response.data.choices?.[0]?.message?.content || '';
          const parsed = this.extractJson(content);
          if (parsed && parsed.questions) {
            questions = parsed.questions;
          }
        } catch (err) {
          throw new Error('Error al conectar con la API de Groq: ' + (err.response?.data?.error?.message || err.message));
        }
      } else if (this.openAiApiKey) {
        // Respaldo: OpenAI si está disponible
        try {
          const response = await axios.post(this.openAiURL, {
            model: this.openAiModel,
            messages: [
              { role: 'system', content: 'Eres un experto en crear preguntas de trivia educativas y entretenidas. Responde siempre en formato JSON válido.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
          }, {
            headers: {
              'Authorization': `Bearer ${this.openAiApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          const content = response.data.choices?.[0]?.message?.content || '';
          const parsed = this.extractJson(content);
          if (parsed && parsed.questions) {
            questions = parsed.questions;
          }
        } catch (err) {
          throw new Error('Error al conectar con la API de OpenAI: ' + (err.response?.data?.error?.message || err.message));
        }
      }

      if (!questions || questions.length === 0) {
        throw new Error('La IA no devolvió preguntas válidas. Verifica tu API key y conexión.');
      }

      // Filtrar preguntas repetidas (por texto)
      const uniqueQuestions = [];
      const seen = new Set();
      for (const q of questions) {
        const key = q.text && q.text.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueQuestions.push(q);
        }
      }

      if (uniqueQuestions.length < count) {
        throw new Error('La IA no generó suficientes preguntas únicas.');
      }

      return { questions: uniqueQuestions.slice(0, count) };
    } catch (error) {
      throw error;
    }
  }

  // Generar preguntas usando una API gratuita alternativa
  async generateQuestionsFree(topic, difficulty = 'medium', count = 5) {
    try {
      throw new Error('No se pueden generar preguntas locales.');
    } catch (error) {
  // ...log eliminado...
        throw new Error('No se pueden generar preguntas con IA.');
    }
  }

 
  // Llenar template con datos dinámicos
  fillTemplate(template, topic, difficulty) {
    return {
      ...template,
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: topic,
      difficulty: difficulty,
      source: 'AI Generated'
    };
  }

  // Construir prompt para OpenAI
  buildPrompt(topic, difficulty, count) {
    return `Genera ${count} preguntas de trivia sobre el tema "${topic}" con dificultad ${difficulty}.

Formato requerido (JSON válido):
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Pregunta aquí",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswerIndex": 0,
      "category": "${topic}",
      "difficulty": "${difficulty}",
      "explanation": "Explicación de la respuesta correcta"
    }
  ]
}

Requisitos:
- Preguntas interesantes y educativas
- 4 opciones de respuesta
- Explicación clara de la respuesta correcta
- Dificultad apropiada para el nivel ${difficulty}
- Tema: ${topic}

Responde solo con el JSON, sin texto adicional.`;
  }

  // Preguntas de respaldo si falla la IA
  getFallbackQuestions(topic, difficulty, count) {
    throw new Error('No se pueden generar preguntas de respaldo.');
  }

  // Obtener temas disponibles
  getAvailableTopics() {
    return [
      'Ciencia',
      'Historia',
      'Geografía',
      'Tecnología',
      'Deportes',
      'Arte',
      'Literatura',
      'Matemáticas',
      'Biología',
      'Química',
      'Física',
      'Astronomía',
      'Música',
      'Cine',
      'Videojuegos'
    ];
  }

  // Obtener niveles de dificultad
  getDifficultyLevels() {
    return [
      { value: 'easy', label: 'Fácil' },
      { value: 'medium', label: 'Medio' },
      { value: 'hard', label: 'Difícil' }
    ];
  }
}

module.exports = AIQuestionGenerator;

