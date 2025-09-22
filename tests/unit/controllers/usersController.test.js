// HU19: Crear pruebas para el registro de usuario
// HU20: Crear pruebas para la recuperación de contraseña  
// HU21: Crear pruebas para la consulta de estadísticas personales

const request = require('supertest');
const express = require('express');
const usersController = require('../../../controllers/usersController');
const { auth, db } = require('../../../firebase');

const app = express();
app.use(express.json());

// Configurar rutas para testing
app.post('/register', usersController.register);
app.post('/recover-password', usersController.recoverPassword);
app.get('/stats', usersController.getStats);
app.get('/history', usersController.getHistory);

describe('Users Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HU19: Pruebas para el registro de usuario
  describe('POST /register - HU19', () => {
    test('Debe registrar un usuario exitosamente con datos válidos', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };
      
      const mockUserRecord = { uid: 'test-uid-123' };
      auth.createUser.mockResolvedValue(mockUserRecord);
      
      const mockDocRef = {
        set: jest.fn().mockResolvedValue()
      };
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .post('/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      expect(auth.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
    });

    test('Debe fallar con email duplicado', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User'
      };
      
      auth.createUser.mockRejectedValue(new Error('El email ya está en uso'));

      // Act
      const response = await request(app)
        .post('/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El email ya está en uso');
    });

    test('Debe fallar con campos faltantes', async () => {
      // Arrange
      const incompleteData = {
        email: 'test@example.com'
        // Faltan password y displayName
      };

      // Act
      const response = await request(app)
        .post('/register')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // HU20: Pruebas para la recuperación de contraseña
  describe('POST /recover-password - HU20', () => {
    test('Debe enviar email de recuperación para usuario existente', async () => {
      // Arrange
      const email = 'test@example.com';
      auth.generatePasswordResetLink.mockResolvedValue('reset-link');

      // Act
      const response = await request(app)
        .post('/recover-password')
        .send({ email });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset email sent.');
      expect(auth.generatePasswordResetLink).toHaveBeenCalledWith(email);
    });

    test('Debe fallar con email no registrado', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      auth.generatePasswordResetLink.mockRejectedValue(new Error('Usuario no encontrado'));

      // Act
      const response = await request(app)
        .post('/recover-password')
        .send({ email });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Usuario no encontrado');
    });
  });

  // HU21: Pruebas para la consulta de estadísticas personales
  describe('GET /stats - HU21', () => {
    test('Debe obtener estadísticas para usuario existente', async () => {
      // Arrange
      const uid = 'test-uid-123';
      const mockUserData = {
        stats: { gamesPlayed: 5, wins: 2, correctAnswers: 25 }
      };
      
      const mockDoc = {
        exists: true,
        data: () => mockUserData
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      // Act
      const response = await request(app)
        .get('/stats')
        .query({ uid });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        uid: 'test-uid-123',
        stats: { gamesPlayed: 5, wins: 2, correctAnswers: 25 }
      });
    });

    test('Debe crear estadísticas para usuario nuevo', async () => {
      // Arrange
      const uid = 'new-user-uid';
      
      const mockDoc = {
        exists: false
      };
      
      const mockDocRef = {
        get: jest.fn()
          .mockResolvedValueOnce(mockDoc) // Primera llamada: no existe
          .mockResolvedValueOnce({ // Segunda llamada: después de crear
            exists: true,
            data: () => ({ stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 } })
          }),
        set: jest.fn().mockResolvedValue()
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      // Act
      const response = await request(app)
        .get('/stats')
        .query({ uid });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.uid).toBe('new-user-uid');
      expect(response.body.stats).toEqual({ gamesPlayed: 0, wins: 0, correctAnswers: 0 });
    });

    test('Debe fallar sin UID', async () => {
      // Act
      const response = await request(app)
        .get('/stats');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing uid');
    });
  });
});