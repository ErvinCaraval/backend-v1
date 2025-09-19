const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const authenticate = require('../middleware/authenticate');

router.post('/register', usersController.register);
router.post('/login', usersController.login); 
router.post('/recover-password', usersController.recoverPassword);
router.get('/me/stats', authenticate, usersController.getStats);
router.get('/me/history', authenticate, usersController.getHistory);

module.exports = router;
