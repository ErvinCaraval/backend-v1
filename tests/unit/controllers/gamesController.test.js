// HU22: Crear pruebas para el listado de partidas públicas

const request = require('supertest');
const express = require('express');
const gamesController = require('../../../controllers/gamesController');
const { db } = require('../../../firebase');

const app = express();
app.use(express.json());

// Configurar rutas para testing
app.get('/games', gamesController.listPublicGames);

describe('Games Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HU22: Pruebas para el listado de partidas públicas
  describe('GET /games - HU22', () => {
    test('Debe listar solo partidas públicas en estado waiting', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game1',
          isPublic: true,
          status: 'waiting',
          hostId: 'user1',
          players: [{ uid: 'user1', displayName: 'Host User', score: 0 }],
          topic: 'Ciencia',
          createdAt: Date.now()
        },
        {
          id: 'game2',
          isPublic: true,
          status: 'waiting',
          hostId: 'user2',
          players: [
            { uid: 'user2', displayName: 'Host User 2', score: 0 },
            { uid: 'user3', displayName: 'Player 3', score: 0 }
          ],
          topic: 'Historia',
          createdAt: Date.now()
        }
      ];

      const mockSnapshot = {
        docs: mockGames.map(game => ({
          id: game.id,
          data: () => ({ ...game, id: undefined })
        }))
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      db.collection.mockReturnValue(mockQuery);

      // Act
      const response = await request(app).get('/games');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('game1');
      expect(response.body[0].isPublic).toBe(true);
      expect(response.body[0].status).toBe('waiting');
      expect(response.body[1].id).toBe('game2');
      
      // Verificar que se aplicaron los filtros correctos
      expect(mockQuery.where).toHaveBeenCalledWith('isPublic', '==', true);
      expect(mockQuery.where).toHaveBeenCalledWith('status', '==', 'waiting');
    });

    test('Debe devolver array vacío si no hay partidas públicas disponibles', async () => {
      // Arrange
      const mockSnapshot = { docs: [] };
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      db.collection.mockReturnValue(mockQuery);

      // Act
      const response = await request(app).get('/games');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('Debe devolver el formato correcto de información de partidas', async () => {
      // Arrange
      const mockGame = {
        id: 'detailed-game',
        isPublic: true,
        status: 'waiting',
        hostId: 'host-user',
        players: [
          { uid: 'host-user', displayName: 'Host Player', score: 0 }
        ],
        topic: 'Geografía',
        difficulty: 'medium',
        questions: [
          {
            text: '¿Cuál es la capital de Francia?',
            options: ['Madrid', 'París', 'Roma', 'Berlín'],
            correctAnswerIndex: 1,
            category: 'Geografía'
          }
        ],
        createdAt: 1640995200000
      };

      const mockSnapshot = {
        docs: [{
          id: mockGame.id,
          data: () => ({ ...mockGame, id: undefined })
        }]
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      db.collection.mockReturnValue(mockQuery);

      // Act
      const response = await request(app).get('/games');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      
      const game = response.body[0];
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('isPublic');
      expect(game).toHaveProperty('status');
      expect(game).toHaveProperty('players');
      expect(game).toHaveProperty('topic');
      expect(game.players).toBeInstanceOf(Array);
      expect(game.players[0]).toHaveProperty('uid');
      expect(game.players[0]).toHaveProperty('displayName');
    });

    test('Debe manejar errores de base de datos', async () => {
      // Arrange
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };

      db.collection.mockReturnValue(mockQuery);

      // Act
      const response = await request(app).get('/games');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Database connection error');
    });
  });
});