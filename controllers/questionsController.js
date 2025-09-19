// Bulk create questions
exports.bulkCreate = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'No questions provided' });
    }
    const batch = db.batch();
    questions.forEach(q => {
      const docRef = db.collection('questions').doc();
      batch.set(docRef, q);
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
const { db } = require('../firebase');

// Get all questions
exports.getAll = async (req, res) => {
  try {
    const snapshot = await db.collection('questions').get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new question
exports.create = async (req, res) => {
  try {
    const { text, options, correctAnswerIndex, category, explanation } = req.body;
    const docRef = await db.collection('questions').add({ text, options, correctAnswerIndex, category, explanation });
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a question
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('questions').doc(id).update(req.body);
    res.json({ message: 'Question updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a question
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('questions').doc(id).delete();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
