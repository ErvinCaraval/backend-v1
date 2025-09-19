const express = require('express');
const router = express.Router();

const questionsController = require('../controllers/questionsController');
const authenticate = require('../middleware/authenticate');


router.get('/', questionsController.getAll);
router.post('/', authenticate, questionsController.create);
router.post('/bulk', authenticate, questionsController.bulkCreate);
router.put('/:id', authenticate, questionsController.update);
router.delete('/:id', authenticate, questionsController.remove);

module.exports = router;
