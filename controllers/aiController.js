const AIQuestionGenerator = require('../services/aiQuestionGenerator');

class AIController {
  constructor() {
    this.aiGenerator = new AIQuestionGenerator();
  }

  // Generar preguntas con IA
  async generateQuestions(req, res) {
    try {
      const { topic, difficulty = 'medium', count = 5, useAI = false } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'El tema es requerido' });
      }
      if (!useAI) {
        return res.status(400).json({ error: 'Debes activar el modo IA para generar preguntas. No se permiten preguntas locales.' });
      }
      if (!count || typeof count !== 'number' || count < 1) {
        return res.status(400).json({ error: 'El número de preguntas debe ser mayor que cero.' });
      }

      const result = await this.aiGenerator.generateQuestions(topic, difficulty, count);
      if (!result.questions || !Array.isArray(result.questions) || result.questions.length < count) {
        return res.status(500).json({ error: 'No se pudieron generar suficientes preguntas con IA. Intenta de nuevo o revisa tu API Key.' });
      }

      res.json({
        success: true,
        topic,
        difficulty,
        count: result.questions.length,
        questions: result.questions
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }


  getTopics(req, res) {
    try {
      const topics = this.aiGenerator.getAvailableTopics();
      res.json({
        success: true,
        topics
      });
    } catch (error) {

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener niveles de dificultad
  getDifficultyLevels(req, res) {
    try {
      const levels = this.aiGenerator.getDifficultyLevels();
      res.json({
        success: true,
        levels
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Generar preguntas para un juego específico
  async generateGameQuestions(req, res) {
    try {
      const { gameId, topic, difficulty = 'medium', count = 10 } = req.body;

      if (!gameId || !topic) {
        return res.status(400).json({ error: 'gameId y topic son requeridos' });
      }

      const questions = await this.aiGenerator.generateQuestionsFree(topic, difficulty, count);


      res.json({
        success: true,
        gameId,
        topic,
        difficulty,
        count: questions.questions.length,
        questions: questions.questions
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = AIController;

