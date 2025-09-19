// Obtener historial de partidas del usuario
exports.getHistory = async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });
  try {
    const snapshot = await db.collection('gameResults')
      .where('uid', '==', uid)
      .orderBy('date', 'desc')
      .limit(50)
      .get();
    const history = snapshot.docs.map(doc => doc.data());
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const { auth, db } = require('../firebase');

// Register a new user
exports.register = async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });
    // Add user to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
    });
    res.status(201).json({ uid: userRecord.uid, email, displayName });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login (session endpoint, optional)
exports.login = async (req, res) => {
  // Normally handled client-side with Firebase Auth
  res.status(501).json({ error: 'Login handled on client.' });
};

// Password recovery
exports.recoverPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await auth.generatePasswordResetLink(email);
    res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  // In production, validate user identity (e.g., via Firebase ID token)
  const { uid } = req.query;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(userDoc.data());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
