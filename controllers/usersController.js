// Obtener historial de partidas del usuario
exports.getHistory = async (req, res) => {
  // Historial de partidas deshabilitado profesionalmente
  res.json([]);
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
  // Usar el UID autenticado si existe, o el de la query como fallback
  const uid = req.user?.uid || req.query.uid;
  if (!uid) {
    console.warn('[getStats] Falta UID. req.user:', req.user, 'req.query:', req.query);
    return res.status(400).json({ error: 'Missing uid' });
  }
  try {
    const userRef = db.collection('users').doc(uid);
    let userDoc = await userRef.get();
    if (!userDoc.exists) {
      // Crear el documento si no existe, usando datos del token JWT si están disponibles
      const displayName = req.user?.name || req.user?.displayName || '';
      const email = req.user?.email || '';
      const newUser = {
        displayName,
        email,
        stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
      };
      await userRef.set(newUser);
      userDoc = await userRef.get();
      console.log(`[getStats] Documento de usuario creado para UID ${uid}:`, newUser);
    }
    // Devolver siempre un objeto profesional y completo
    const data = userDoc.data();
    const response = {
      uid,
      stats: data.stats || { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
    };
    res.json(response);
  } catch (error) {
    console.error('[getStats] Error:', error);
    res.status(400).json({ error: error.message });
  }
};
