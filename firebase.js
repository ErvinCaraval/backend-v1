// Firebase Admin SDK initialization for backend
const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key JSON file
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
