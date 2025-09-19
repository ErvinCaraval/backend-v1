const { db } = require('../firebase');

// List all public games with 'waiting' status
exports.listPublicGames = async (req, res) => {
  try {
    const snapshot = await db.collection('games')
      .where('isPublic', '==', true)
      .where('status', '==', 'waiting')
      .get();
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(games);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
