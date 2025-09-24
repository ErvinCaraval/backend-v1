const request = require('supertest');
const express = require('express');
const usersController = require('../../controllers/usersController');
const authenticate = require('../../middleware/authenticate');

const app = express();
app.use(express.json());
app.post('/api/users/register', usersController.register);
app.post('/api/users/login', usersController.login);
app.post('/api/users/recover-password', usersController.recoverPassword);
app.get('/api/users/me/stats', authenticate, usersController.getStats);
app.get('/api/users/me/history', authenticate, usersController.getHistory);

jest.mock('../../middleware/authenticate', () => (req, res, next) => next());
jest.mock('../../firebase', () => ({ auth: { createUser: jest.fn(), generatePasswordResetLink: jest.fn() }, db: { collection: jest.fn() } }));

describe('Users API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/users/register', () => {
    test('registers user', async () => {
      require('../../firebase').auth.createUser.mockResolvedValue({ uid: '1', email: 'a', displayName: 'c' });
      require('../../firebase').db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: jest.fn().mockResolvedValue() }) });
      const res = await request(app).post('/api/users/register').send({ email: 'a', password: 'b', displayName: 'c' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('uid');
    });
    test('handles error', async () => {
      require('../../firebase').auth.createUser.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/api/users/register').send({ email: 'a', password: 'b', displayName: 'c' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    test('returns 501', async () => {
      const res = await request(app).post('/api/users/login').send({ email: 'a', password: 'b' });
      expect(res.status).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/recover-password', () => {
    test('sends reset email', async () => {
      require('../../firebase').auth.generatePasswordResetLink.mockResolvedValue();
      const res = await request(app).post('/api/users/recover-password').send({ email: 'a' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
    test('handles error', async () => {
      require('../../firebase').auth.generatePasswordResetLink.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/api/users/recover-password').send({ email: 'a' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/me/stats', () => {
    test('400 if missing uid', async () => {
      const res = await request(app).get('/api/users/me/stats');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/me/history', () => {
    test('returns empty array', async () => {
      const res = await request(app).get('/api/users/me/history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
