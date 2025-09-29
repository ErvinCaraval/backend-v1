const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');
const authenticate = require('../middleware/authenticate');

router.get('/', gamesController.listPublicGames);

// Route to delete a public game (only creator can delete)
router.delete('/:gameId', authenticate, gamesController.deletePublicGame);

module.exports = router;
