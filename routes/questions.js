const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');


router.get('/', questionsController.getAll);
router.post('/', questionsController.create);
router.post('/bulk', questionsController.bulkCreate);
router.put('/:id', questionsController.update);
router.delete('/:id', questionsController.remove);

module.exports = router;
