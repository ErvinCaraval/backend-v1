const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/register', usersController.register);
router.post('/login', usersController.login); // For session endpoint if needed
router.post('/recover-password', usersController.recoverPassword);
router.get('/me/stats', usersController.getStats);

module.exports = router;
