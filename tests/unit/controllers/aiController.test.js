// HU33: Crear pruebas para la generación de preguntas de trivia con IA
// HU34: Crear pruebas para la consulta de temas IA
// HU35: Crear pruebas para la consulta de niveles de dificultad IA
// HU36: Crear pruebas para la generación de preguntas IA para un juego específico

const request = require('supertest');
const express = require('express');
const AIController = require('../../../controllers/aiController');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

const app = express();
app.use(express.json());

const aiController = new AIController();

// Configurar rutas para testing
app.post('/generate-questions', (req, res) => aiController.generateQuestions(req, res));
app.get('/topics', (req, res) => aiController.getTopics(req, res));
app.get('/difficulty-levels', (req, res) => aiController.getDifficultyLevels(req, res));
app.post('/generate-game-questions', (req, res) => aiController.generateGameQuestions(req, res));

describe('AI Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar variables de entorno para las pruebas
    process.env.GROQ_API_KEY = 'test-groq-key';
  });

  // HU33: Pruebas para la generación de preguntas de trivia con IA
  describe('POST /generate-questions - HU33', () => {
    test('Debe generar preguntas exitosamente con parámetros válidos', async () => {
      // Arrange
      const requestData = {
        topic: 'Ciencia',
        difficulty: 'medium',
        count: 3,
        useAI: true
      };

      const mockAIResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                questions: [
                  {
                    id: 'ai_1',
                    text: '¿Cuál es el símbolo químico del oro?',
                    options: ['Au', 'Ag', 'Fe', 'Cu'],
                    correctAnswerIndex: 0,
                    category: 'Ciencia',
                    difficulty: 'medium',
                    explanation: 'Au es el símbolo químico del oro'
                  },
                  {
                    id: 'ai_2',
                    text: '¿Quién propuso la teoría de la relatividad?',
                    options: ['Newton', 'Einstein', 'Galileo', 'Darwin'],
                    correctAnswerIndex: 1,
                    category: 'Ciencia',
                    difficulty: 'medium',
                    explanation: 'Einstein propuso la teoría de la relatividad'
                  },
                  {
                    id: 'ai_3',
                    text: '¿Cuál es la velocidad de la luz?',
                    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
                    correctAnswerIndex: 0,
                    category: 'Ciencia',
                    difficulty: 'medium',
                    explanation: 'La velocidad de la luz es aproximadamente 300,000 km/s'
                  }
                ]
              })
            }
          }]
        }
      };

      mockedAxios.post.mockResolvedValue(mockAIResponse);

      // Act
      const response = await request(app)
        .post('/generate-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.topic).toBe('Ciencia');
      expect(response.body.difficulty).toBe('medium');
      expect(response.body.count).toBe(3);
      expect(response.body.questions).toHaveLength(3);
      expect(response.body.questions[0].text).toBe('¿Cuál es el símbolo químico del oro?');
    });

    test('Debe fallar sin tema especificado', async () => {
      // Arrange
      const requestData = {
        difficulty: 'medium',
        count: 3,
        useAI: true
      };

      // Act
      const response = await request(app)
        .post('/generate-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El tema es requerido');
    });

    test('Debe fallar con useAI=false', async () => {
      // Arrange
      const requestData = {
        topic: 'Ciencia',
        difficulty: 'medium',
        count: 3,
        useAI: false
      };

      // Act
      const response = await request(app)
        .post('/generate-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Debes activar el modo IA para generar preguntas. No se permiten preguntas locales.');
    });

    test('Debe fallar cuando la IA no devuelve suficientes preguntas', async () => {
      // Arrange
      const requestData = {
        topic: 'Ciencia',
        difficulty: 'medium',
        count: 5,
        useAI: true
      };

      const mockAIResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                questions: [
                  {
                    text: 'Solo una pregunta',
                    options: ['A', 'B', 'C', 'D'],
                    correctAnswerIndex: 0
                  }
                ]
              })
            }
          }]
        }
      };

      mockedAxios.post.mockResolvedValue(mockAIResponse);

      // Act
      const response = await request(app)
        .post('/generate-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudieron generar suficientes preguntas con IA. Intenta de nuevo o revisa tu API Key.');
    });

    test('Debe fallar cuando la API de IA devuelve error', async () => {
      // Arrange
      const requestData = {
        topic: 'Ciencia',
        difficulty: 'medium',
        count: 3,
        useAI: true
      };

      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      // Act
      const response = await request(app)
        .post('/generate-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  // HU34: Pruebas para la consulta de temas IA
  describe('GET /topics - HU34', () => {
    test('Debe devolver la lista de temas disponibles', async () => {
      // Act
      const response = await request(app).get('/topics');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.topics).toBeInstanceOf(Array);
      expect(response.body.topics).toContain('Ciencia');
      expect(response.body.topics).toContain('Historia');
      expect(response.body.topics).toContain('Geografía');
    });

    test('Debe devolver el formato correcto de respuesta', async () => {
      // Act
      const response = await request(app).get('/topics');

      // Assert
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('topics');
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.topics)).toBe(true);
    });
  });

  // HU35: Pruebas para la consulta de niveles de dificultad IA
  describe('GET /difficulty-levels - HU35', () => {
    test('Debe devolver la lista de niveles de dificultad', async () => {
      // Act
      const response = await request(app).get('/difficulty-levels');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.levels).toBeInstanceOf(Array);
      expect(response.body.levels).toHaveLength(3);
      
      const levels = response.body.levels;
      expect(levels.find(l => l.value === 'easy')).toBeDefined();
      expect(levels.find(l => l.value === 'medium')).toBeDefined();
      expect(levels.find(l => l.value === 'hard')).toBeDefined();
    });

    test('Debe devolver el formato correcto de niveles', async () => {
      // Act
      const response = await request(app).get('/difficulty-levels');

      // Assert
      const levels = response.body.levels;
      levels.forEach(level => {
        expect(level).toHaveProperty('value');
        expect(level).toHaveProperty('label');
        expect(typeof level.value).toBe('string');
        expect(typeof level.label).toBe('string');
      });
    });
  });

  // HU36: Pruebas para la generación de preguntas IA para un juego específico
  describe('POST /generate-game-questions - HU36', () => {
    test('Debe generar preguntas para un juego específico', async () => {
      // Arrange
      const requestData = {
        gameId: 'game-123',
        topic: 'Historia',
        difficulty: 'hard',
        count: 10
      };

      // Mock del método generateQuestionsFree
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        text: `Pregunta de historia ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 0,
        category: 'Historia',
        difficulty: 'hard'
      }));

      // Necesitamos mockear el método interno
      jest.spyOn(aiController.aiGenerator, 'generateQuestionsFree')
        .mockResolvedValue({ questions: mockQuestions });

      // Act
      const response = await request(app)
        .post('/generate-game-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.gameId).toBe('game-123');
      expect(response.body.topic).toBe('Historia');
      expect(response.body.difficulty).toBe('hard');
      expect(response.body.count).toBe(10);
      expect(response.body.questions).toHaveLength(10);
    });

    test('Debe fallar con parámetros faltantes', async () => {
      // Arrange - Sin gameId
      const requestData = {
        topic: 'Historia',
        difficulty: 'medium',
        count: 5
      };

      // Act
      const response = await request(app)
        .post('/generate-game-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('gameId y topic son requeridos');
    });

    test('Debe fallar sin topic', async () => {
      // Arrange - Sin topic
      const requestData = {
        gameId: 'game-123',
        difficulty: 'medium',
        count: 5
      };

      // Act
      const response = await request(app)
        .post('/generate-game-questions')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('gameId y topic son requeridos');
    });
  });
});