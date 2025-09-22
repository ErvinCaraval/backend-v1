// HU28: Crear pruebas para el listado de preguntas
// HU29: Crear pruebas para la creación manual de preguntas
// HU30: Crear pruebas para la creación masiva de preguntas
// HU31: Crear pruebas para la actualización de preguntas
// HU32: Crear pruebas para la eliminación de preguntas

const request = require('supertest');
const express = require('express');
const questionsController = require('../../../controllers/questionsController');
const { db } = require('../../../firebase');

const app = express();
app.use(express.json());

// Mock del middleware de autenticación
const mockAuth = (req, res, next) => {
  req.user = { uid: 'test-uid' };
  next();
};

// Configurar rutas para testing
app.get('/questions', questionsController.getAll);
app.post('/questions', mockAuth, questionsController.create);
app.post('/questions/bulk', mockAuth, questionsController.bulkCreate);
app.put('/questions/:id', mockAuth, questionsController.update);
app.delete('/questions/:id', mockAuth, questionsController.remove);

describe('Questions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HU28: Pruebas para el listado de preguntas
  describe('GET /questions - HU28', () => {
    test('Debe devolver todas las preguntas correctamente', async () => {
      // Arrange
      const mockQuestions = [
        {
          id: 'q1',
          text: '¿Cuál es la capital de Francia?',
          options: ['Madrid', 'París', 'Roma', 'Berlín'],
          correctAnswerIndex: 1,
          category: 'Geografía',
          difficulty: 'easy'
        },
        {
          id: 'q2',
          text: '¿Quién escribió Don Quijote?',
          options: ['Cervantes', 'Lope de Vega', 'Calderón', 'Góngora'],
          correctAnswerIndex: 0,
          category: 'Literatura',
          difficulty: 'medium'
        }
      ];

      const mockSnapshot = {
        docs: mockQuestions.map(q => ({
          id: q.id,
          data: () => ({ ...q, id: undefined })
        }))
      };

      db.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      // Act
      const response = await request(app).get('/questions');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('¿Cuál es la capital de Francia?');
      expect(response.body[1].text).toBe('¿Quién escribió Don Quijote?');
    });

    test('Debe devolver array vacío si no hay preguntas', async () => {
      // Arrange
      const mockSnapshot = { docs: [] };
      db.collection.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      // Act
      const response = await request(app).get('/questions');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // HU29: Pruebas para la creación manual de preguntas
  describe('POST /questions - HU29', () => {
    test('Debe crear una pregunta exitosamente', async () => {
      // Arrange
      const questionData = {
        text: '¿Cuál es la capital de España?',
        options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
        correctAnswerIndex: 0,
        category: 'Geografía',
        difficulty: 'easy',
        explanation: 'Madrid es la capital de España'
      };

      const mockDocRef = { id: 'new-question-id' };
      db.collection.mockReturnValue({
        add: jest.fn().mockResolvedValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .post('/questions')
        .send(questionData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new-question-id');
    });

    test('Debe fallar con campos faltantes', async () => {
      // Arrange
      const incompleteData = {
        text: '¿Pregunta incompleta?'
        // Faltan options, correctAnswerIndex, etc.
      };

      db.collection.mockReturnValue({
        add: jest.fn().mockRejectedValue(new Error('Campos requeridos faltantes'))
      });

      // Act
      const response = await request(app)
        .post('/questions')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // HU30: Pruebas para la creación masiva de preguntas
  describe('POST /questions/bulk - HU30', () => {
    test('Debe crear varias preguntas exitosamente', async () => {
      // Arrange
      const questionsData = {
        questions: [
          {
            text: '¿Pregunta 1?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 0,
            category: 'Test',
            difficulty: 'easy',
            explanation: 'Explicación 1'
          },
          {
            text: '¿Pregunta 2?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 1,
            category: 'Test',
            difficulty: 'medium',
            explanation: 'Explicación 2'
          }
        ]
      };

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };

      db.batch = jest.fn().mockReturnValue(mockBatch);
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' })
      });

      // Act
      const response = await request(app)
        .post('/questions/bulk')
        .send(questionsData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    test('Debe fallar con array vacío', async () => {
      // Act
      const response = await request(app)
        .post('/questions/bulk')
        .send({ questions: [] });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No questions provided');
    });

    test('Debe fallar sin array de preguntas', async () => {
      // Act
      const response = await request(app)
        .post('/questions/bulk')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // HU31: Pruebas para la actualización de preguntas
  describe('PUT /questions/:id - HU31', () => {
    test('Debe actualizar una pregunta exitosamente', async () => {
      // Arrange
      const questionId = 'question-123';
      const updateData = {
        text: '¿Pregunta actualizada?',
        difficulty: 'hard'
      };

      const mockDocRef = {
        update: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .put(`/questions/${questionId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Question updated');
      expect(mockDocRef.update).toHaveBeenCalledWith(updateData);
    });

    test('Debe fallar al actualizar pregunta inexistente', async () => {
      // Arrange
      const questionId = 'nonexistent-question';
      const updateData = { text: 'Nueva pregunta' };

      const mockDocRef = {
        update: jest.fn().mockRejectedValue(new Error('Pregunta no encontrada'))
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .put(`/questions/${questionId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Pregunta no encontrada');
    });
  });

  // HU32: Pruebas para la eliminación de preguntas
  describe('DELETE /questions/:id - HU32', () => {
    test('Debe eliminar una pregunta exitosamente', async () => {
      // Arrange
      const questionId = 'question-to-delete';

      const mockDocRef = {
        delete: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .delete(`/questions/${questionId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Question deleted');
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    test('Debe fallar al eliminar pregunta inexistente', async () => {
      // Arrange
      const questionId = 'nonexistent-question';

      const mockDocRef = {
        delete: jest.fn().mockRejectedValue(new Error('Pregunta no encontrada'))
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .delete(`/questions/${questionId}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Pregunta no encontrada');
    });
  });
});