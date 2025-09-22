// HU23: Crear pruebas para la creación de partidas multijugador
// HU24: Crear pruebas para unirse a partidas existentes
// HU25: Crear pruebas para el inicio de partida
// HU26: Crear pruebas para responder preguntas en tiempo real
// HU27: Crear pruebas para ver resultados y estadísticas al finalizar la partida

const Client = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { db, auth } = require('../../../firebase');

describe('WebSocket Game Flow Integration Tests', () => {
  let httpServer;
  let io;
  let clientSocket1;
  let clientSocket2;
  let serverSocket;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    // Importar y configurar los event handlers del servidor real
    require('../../../hybridServer');
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      
      // Crear clientes de prueba
      clientSocket1 = new Client(`http://localhost:${port}`);
      clientSocket2 = new Client(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket1.on('connect', () => {
        clientSocket2.on('connect', done);
      });
    });
  });

  afterAll(() => {
    io.close();
    httpServer.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase Auth para tokens válidos
    auth.verifyIdToken.mockResolvedValue({
      uid: 'test-user-1',
      email: 'test@example.com'
    });

    // Mock Firestore operations
    const mockDocRef = {
      set: jest.fn().mockResolvedValue(),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          hostId: 'test-user-1',
          isPublic: true,
          status: 'waiting',
          players: [{ uid: 'test-user-1', displayName: 'Test User', score: 0 }],
          questions: [
            {
              text: '¿Pregunta de prueba?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswerIndex: 1,
              category: 'Test'
            }
          ],
          currentQuestion: 0
        })
      }),
      update: jest.fn().mockResolvedValue()
    };

    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef)
    });
  });

  // HU23: Pruebas para la creación de partidas multijugador
  describe('Create Game - HU23', () => {
    test('Debe crear una partida exitosamente con datos válidos', (done) => {
      // Arrange
      const gameOptions = {
        hostId: 'test-user-1',
        displayName: 'Test Host',
        isPublic: true,
        token: 'valid-jwt-token',
        topic: 'Ciencia',
        difficulty: 'medium',
        count: 5,
        questions: [
          {
            text: '¿Pregunta 1?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 0,
            category: 'Ciencia'
          },
          {
            text: '¿Pregunta 2?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 1,
            category: 'Ciencia'
          }
        ]
      };

      // Act & Assert
      clientSocket1.emit('createGame', gameOptions);
      
      clientSocket1.on('gameCreated', (response) => {
        expect(response).toHaveProperty('gameId');
        expect(response.hostId).toBe('test-user-1');
        expect(response.isPublic).toBe(true);
        expect(response.status).toBe('waiting');
        expect(response.players).toHaveLength(1);
        expect(response.questions).toHaveLength(2);
        done();
      });
    });

    test('Debe fallar sin token de autenticación', (done) => {
      // Arrange
      const gameOptions = {
        hostId: 'test-user-1',
        displayName: 'Test Host',
        isPublic: true,
        // Sin token
        questions: []
      };

      // Act & Assert
      clientSocket1.emit('createGame', gameOptions);
      
      clientSocket1.on('error', (error) => {
        expect(error.error).toBe('Missing authentication token');
        done();
      });
    });

    test('Debe fallar sin preguntas', (done) => {
      // Arrange
      const gameOptions = {
        hostId: 'test-user-1',
        displayName: 'Test Host',
        token: 'valid-jwt-token',
        questions: [] // Sin preguntas
      };

      // Act & Assert
      clientSocket1.emit('createGame', gameOptions);
      
      clientSocket1.on('error', (error) => {
        expect(error.error).toBe('No se recibieron preguntas nuevas para crear la partida.');
        done();
      });
    });
  });

  // HU24: Pruebas para unirse a partidas existentes
  describe('Join Game - HU24', () => {
    test('Debe permitir unirse a una partida disponible', (done) => {
      // Arrange
      const joinData = {
        gameId: 'test-game-123',
        uid: 'test-user-2',
        displayName: 'Player 2'
      };

      // Mock game data
      const mockGameData = {
        exists: true,
        data: () => ({
          status: 'waiting',
          players: [
            { uid: 'test-user-1', displayName: 'Host', score: 0 }
          ]
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket2.emit('joinGame', joinData);
      
      clientSocket2.on('playerJoined', (response) => {
        expect(response.players).toHaveLength(2);
        expect(response.players.find(p => p.uid === 'test-user-2')).toBeDefined();
        done();
      });
    });

    test('Debe fallar al unirse a partida inexistente', (done) => {
      // Arrange
      const joinData = {
        gameId: 'nonexistent-game',
        uid: 'test-user-2',
        displayName: 'Player 2'
      };

      db.collection().doc().get.mockResolvedValue({ exists: false });

      // Act & Assert
      clientSocket2.emit('joinGame', joinData);
      
      clientSocket2.on('error', (error) => {
        expect(error.error).toBe('Game not found');
        done();
      });
    });

    test('Debe fallar al unirse a partida ya iniciada', (done) => {
      // Arrange
      const joinData = {
        gameId: 'started-game',
        uid: 'test-user-2',
        displayName: 'Player 2'
      };

      const mockGameData = {
        exists: true,
        data: () => ({
          status: 'in-progress', // Ya iniciada
          players: [{ uid: 'test-user-1', displayName: 'Host', score: 0 }]
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket2.emit('joinGame', joinData);
      
      clientSocket2.on('error', (error) => {
        expect(error.error).toBe('Game already started');
        done();
      });
    });
  });

  // HU25: Pruebas para el inicio de partida
  describe('Start Game - HU25', () => {
    test('Debe iniciar partida exitosamente con preguntas válidas', (done) => {
      // Arrange
      const startData = { gameId: 'test-game-123' };

      const mockGameData = {
        exists: true,
        data: () => ({
          status: 'waiting',
          questions: [
            {
              text: '¿Pregunta 1?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswerIndex: 0
            }
          ]
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket1.emit('startGame', startData);
      
      clientSocket1.on('gameStarted', (response) => {
        expect(response.questionsCount).toBe(1);
        done();
      });
    });

    test('Debe fallar al iniciar partida sin preguntas', (done) => {
      // Arrange
      const startData = { gameId: 'empty-game' };

      const mockGameData = {
        exists: true,
        data: () => ({
          status: 'waiting',
          questions: [] // Sin preguntas
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket1.emit('startGame', startData);
      
      clientSocket1.on('error', (error) => {
        expect(error.error).toBe('No hay preguntas asociadas a esta partida.');
        done();
      });
    });
  });

  // HU26: Pruebas para responder preguntas en tiempo real
  describe('Submit Answer - HU26', () => {
    test('Debe procesar respuesta correcta y actualizar puntaje', (done) => {
      // Arrange
      const answerData = {
        gameId: 'test-game-123',
        uid: 'test-user-1',
        answerIndex: 1 // Respuesta correcta
      };

      const mockGameData = {
        exists: true,
        data: () => ({
          currentQuestion: 0,
          questions: [
            {
              text: '¿Pregunta test?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswerIndex: 1,
              explanation: 'B es la respuesta correcta'
            }
          ],
          players: [
            { uid: 'test-user-1', displayName: 'Player 1', score: 0 }
          ]
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket1.emit('submitAnswer', answerData);
      
      clientSocket1.on('answerResult', (response) => {
        expect(response.correctAnswerIndex).toBe(1);
        expect(response.explanation).toBe('B es la respuesta correcta');
        expect(response.players[0].score).toBe(1); // Puntaje actualizado
        done();
      });
    });

    test('Debe procesar respuesta incorrecta sin actualizar puntaje', (done) => {
      // Arrange
      const answerData = {
        gameId: 'test-game-123',
        uid: 'test-user-1',
        answerIndex: 0 // Respuesta incorrecta
      };

      const mockGameData = {
        exists: true,
        data: () => ({
          currentQuestion: 0,
          questions: [
            {
              text: '¿Pregunta test?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswerIndex: 1
            }
          ],
          players: [
            { uid: 'test-user-1', displayName: 'Player 1', score: 5 }
          ]
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);

      // Act & Assert
      clientSocket1.emit('submitAnswer', answerData);
      
      clientSocket1.on('answerResult', (response) => {
        expect(response.players[0].score).toBe(5); // Puntaje sin cambios
        done();
      });
    });
  });

  // HU27: Pruebas para ver resultados y estadísticas al finalizar la partida
  describe('Game Finish - HU27', () => {
    test('Debe finalizar partida y mostrar resultados finales', (done) => {
      // Arrange - Simular última pregunta
      const answerData = {
        gameId: 'final-game',
        uid: 'test-user-1',
        answerIndex: 0
      };

      const mockGameData = {
        exists: true,
        data: () => ({
          currentQuestion: 0, // Última pregunta (índice 0 de 1 pregunta total)
          questions: [
            {
              text: '¿Última pregunta?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswerIndex: 0
            }
          ],
          players: [
            { uid: 'test-user-1', displayName: 'Winner', score: 9 },
            { uid: 'test-user-2', displayName: 'Runner-up', score: 7 }
          ],
          hostId: 'test-user-1',
          topic: 'Test',
          difficulty: 'medium'
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);
      
      // Mock para gameResults collection
      db.collection.mockImplementation((collectionName) => {
        if (collectionName === 'gameResults') {
          return { add: jest.fn().mockResolvedValue() };
        }
        return {
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockGameData),
            update: jest.fn().mockResolvedValue()
          })
        };
      });

      // Mock transaction para actualizar stats
      db.runTransaction.mockImplementation((callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ stats: { gamesPlayed: 5, wins: 2, correctAnswers: 45 } })
          }),
          set: jest.fn()
        };
        return callback(mockTransaction);
      });

      // Act & Assert
      clientSocket1.emit('submitAnswer', answerData);
      
      clientSocket1.on('gameFinished', (response) => {
        expect(response.players).toHaveLength(2);
        expect(response.players[0].score).toBe(10); // +1 por respuesta correcta
        expect(response.players[1].score).toBe(7);
        
        // Verificar que se guardaron los resultados
        expect(db.collection).toHaveBeenCalledWith('gameResults');
        done();
      });
    });

    test('Debe actualizar estadísticas de usuario al finalizar', (done) => {
      // Esta prueba verifica que las estadísticas se actualicen correctamente
      // Similar al test anterior pero enfocado en la actualización de stats
      
      const answerData = {
        gameId: 'stats-game',
        uid: 'test-user-1',
        answerIndex: 0
      };

      // Mock similar al anterior...
      const mockGameData = {
        exists: true,
        data: () => ({
          currentQuestion: 0,
          questions: [{ text: 'Test', options: ['A'], correctAnswerIndex: 0 }],
          players: [{ uid: 'test-user-1', displayName: 'Player', score: 0 }],
          hostId: 'test-user-1'
        })
      };

      db.collection().doc().get.mockResolvedValue(mockGameData);
      
      let transactionCalled = false;
      db.runTransaction.mockImplementation((callback) => {
        transactionCalled = true;
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 } })
          }),
          set: jest.fn()
        };
        return callback(mockTransaction);
      });

      clientSocket1.emit('submitAnswer', answerData);
      
      clientSocket1.on('gameFinished', () => {
        // Verificar que se llamó la transacción para actualizar stats
        expect(transactionCalled).toBe(true);
        done();
      });
    });
  });
});