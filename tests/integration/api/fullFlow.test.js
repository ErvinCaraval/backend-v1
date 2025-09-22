// Pruebas de integración completas que combinan múltiples HUs
const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Mock axios para las pruebas de IA
jest.mock('axios');
const mockedAxios = axios;

// Importar controladores
const usersController = require('../../../controllers/usersController');
const questionsController = require('../../../controllers/questionsController');
const aiController = require('../../../controllers/aiController');
const gamesController = require('../../../controllers/gamesController');

const app = express();
app.use(express.json());

// Mock del middleware de autenticación
const mockAuth = (req, res, next) => {
  req.user = { uid: 'integration-test-user' };
  next();
};

// Configurar todas las rutas
app.post('/api/users/register', usersController.register);
app.get('/api/users/me/stats', mockAuth, usersController.getStats);
app.get('/api/questions', questionsController.getAll);
app.post('/api/questions', mockAuth, questionsController.create);
app.post('/api/questions/bulk', mockAuth, questionsController.bulkCreate);
app.post('/api/ai/generate-questions', (req, res) => new (require('../../../controllers/aiController'))().generateQuestions(req, res));
app.get('/api/games', gamesController.listPublicGames);

describe('Full API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-integration-key';
  });

  describe('Complete User Journey', () => {
    test('Flujo completo: Registro → Generar preguntas IA → Crear preguntas → Listar partidas', async () => {
      // 1. Registro de usuario (HU19)
      const { auth, db } = require('../../../firebase');
      
      const mockUserRecord = { uid: 'journey-user-123' };
      auth.createUser.mockResolvedValue(mockUserRecord);
      
      const mockDocRef = { set: jest.fn().mockResolvedValue() };
      db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          email: 'journey@test.com',
          password: 'password123',
          displayName: 'Journey User'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.uid).toBe('journey-user-123');

      // 2. Generar preguntas con IA (HU33)
      const mockAIResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                questions: [
                  {
                    text: '¿Cuál es la capital de Francia?',
                    options: ['Madrid', 'París', 'Roma', 'Berlín'],
                    correctAnswerIndex: 1,
                    category: 'Geografía',
                    difficulty: 'easy',
                    explanation: 'París es la capital de Francia'
                  },
                  {
                    text: '¿Quién escribió Don Quijote?',
                    options: ['Cervantes', 'Lope de Vega', 'Calderón', 'Góngora'],
                    correctAnswerIndex: 0,
                    category: 'Literatura',
                    difficulty: 'medium',
                    explanation: 'Miguel de Cervantes escribió Don Quijote'
                  }
                ]
              })
            }
          }]
        }
      };

      mockedAxios.post.mockResolvedValue(mockAIResponse);

      const aiResponse = await request(app)
        .post('/api/ai/generate-questions')
        .send({
          topic: 'Cultura General',
          difficulty: 'medium',
          count: 2,
          useAI: true
        });

      expect(aiResponse.status).toBe(200);
      expect(aiResponse.body.questions).toHaveLength(2);

      // 3. Crear preguntas en lote (HU30)
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };

      db.batch = jest.fn().mockReturnValue(mockBatch);
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' })
      });

      const bulkResponse = await request(app)
        .post('/api/questions/bulk')
        .send({ questions: aiResponse.body.questions });

      expect(bulkResponse.status).toBe(200);
      expect(bulkResponse.body.success).toBe(true);

      // 4. Listar preguntas (HU28)
      const mockSnapshot = {
        docs: aiResponse.body.questions.map((q, i) => ({
          id: `question-${i}`,
          data: () => q
        }))
      };

      db.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      const listResponse = await request(app).get('/api/questions');

      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveLength(2);

      // 5. Listar partidas públicas (HU22)
      const mockGamesSnapshot = {
        docs: [{
          id: 'public-game-1',
          data: () => ({
            isPublic: true,
            status: 'waiting',
            hostId: 'some-host',
            players: [{ uid: 'some-host', displayName: 'Host', score: 0 }],
            topic: 'Cultura General'
          })
        }]
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockGamesSnapshot)
      };

      db.collection.mockReturnValue(mockQuery);

      const gamesResponse = await request(app).get('/api/games');

      expect(gamesResponse.status).toBe(200);
      expect(gamesResponse.body).toHaveLength(1);
      expect(gamesResponse.body[0].isPublic).toBe(true);

      // 6. Obtener estadísticas del usuario (HU21)
      const mockUserDoc = {
        exists: true,
        data: () => ({
          stats: { gamesPlayed: 1, wins: 0, correctAnswers: 5 }
        })
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      });

      const statsResponse = await request(app)
        .get('/api/users/me/stats')
        .query({ uid: 'journey-user-123' });

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.stats.gamesPlayed).toBe(1);
    });
  });

  describe('Error Handling Integration', () => {
    test('Debe manejar errores en cascada correctamente', async () => {
      // 1. Fallo en generación IA → Fallback a error
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const aiResponse = await request(app)
        .post('/api/ai/generate-questions')
        .send({
          topic: 'Ciencia',
          difficulty: 'hard',
          count: 5,
          useAI: true
        });

      expect(aiResponse.status).toBe(500);

      // 2. Fallo en creación de preguntas por datos inválidos
      const { db } = require('../../../firebase');
      
      db.batch = jest.fn().mockReturnValue({
        set: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error('Invalid data'))
      });

      const bulkResponse = await request(app)
        .post('/api/questions/bulk')
        .send({
          questions: [{ text: 'Pregunta incompleta' }] // Datos inválidos
        });

      expect(bulkResponse.status).toBe(400);

      // 3. Fallo en consulta de base de datos
      db.collection.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const questionsResponse = await request(app).get('/api/questions');
      expect(questionsResponse.status).toBe(400);
    });
  });

  describe('Performance and Load Tests', () => {
    test('Debe manejar múltiples peticiones concurrentes', async () => {
      // Configurar mocks para respuestas rápidas
      const { db } = require('../../../firebase');
      
      const mockSnapshot = {
        docs: Array.from({ length: 100 }, (_, i) => ({
          id: `question-${i}`,
          data: () => ({
            text: `Pregunta ${i}`,
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 0
          })
        }))
      };

      db.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      // Realizar 10 peticiones concurrentes
      const promises = Array.from({ length: 10 }, () => 
        request(app).get('/api/questions')
      );

      const responses = await Promise.all(promises);

      // Todas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(100);
      });
    });

    test('Debe manejar timeout en APIs externas', async () => {
      // Simular timeout en API de IA
      mockedAxios.post.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const start = Date.now();
      const response = await request(app)
        .post('/api/ai/generate-questions')
        .send({
          topic: 'Ciencia',
          difficulty: 'medium',
          count: 3,
          useAI: true
        });

      const duration = Date.now() - start;

      expect(response.status).toBe(500);
      expect(duration).toBeLessThan(1000); // Debe fallar rápido
    });
  });
});