const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');

router.get('/', gamesController.listPublicGames);

// Route to delete a public game
router.delete('/:gameId', gamesController.deletePublicGame);

module.exports = router;
