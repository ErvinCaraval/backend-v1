// Setup global para todas las pruebas
require('dotenv').config();

// Mock de Firebase para evitar conexiones reales durante las pruebas
jest.mock('../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    })),
    runTransaction: jest.fn()
  },
  auth: {
    createUser: jest.fn(),
    verifyIdToken: jest.fn(),
    generatePasswordResetLink: jest.fn()
  }
}));

// Mock de APIs externas
jest.mock('axios');

// Configuración global de timeouts
jest.setTimeout(30000);