
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { db, auth } = require('./firebase');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Swagger UI para documentación interactiva usando swagger.yaml
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerDocument = yaml.load(fs.readFileSync(__dirname + '/swagger/swagger.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/ai', require('./routes/ai'));

io.on('connection', (socket) => {
  // Listener para enviar la primera pregunta al socket que lo solicita
  socket.on('requestQuestion', async ({ gameId }) => {

    socket.join(gameId); // Unir a la room antes de enviar la pregunta
    await sendQuestion(io, gameId, 0);
  });


  // Create Game
  socket.on('createGame', async (options) => {
    try {
      // Log del token recibido
      // Validar el token de autenticación
      if (!options.token) {
        socket.emit('error', { error: 'Missing authentication token' });
        return;
      }
      let decodedToken;
      try {
        decodedToken = await auth.verifyIdToken(options.token);
      } catch (err) {
        socket.emit('error', { error: 'Invalid authentication token: ' + err.message });
        return;
      }
      if (decodedToken.uid !== options.hostId) {
        socket.emit('error', { error: 'Token UID does not match hostId' });
        return;
      }
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      // REGLA 1: Solo se aceptan preguntas recién generadas, del tema y cantidad exactos
      let questions = Array.isArray(options.questions) ? options.questions : [];
      if (!questions.length) {
        socket.emit('error', { error: 'No se recibieron preguntas nuevas para crear la partida.' });
        return;
      }
      // Validar que todas las preguntas sean del tema seleccionado y cantidad exacta
      if (options.topic) {
        const allMatchTopic = questions.every(q => (q.category || q.topic) === options.topic);
        if (!allMatchTopic) {
          socket.emit('error', { error: 'Todas las preguntas deben ser del tema seleccionado.' });
          return;
        }
      }
      if (options.count && questions.length !== options.count) {
        socket.emit('error', { error: 'La cantidad de preguntas no coincide con la solicitada.' });
        return;
      }
      // Normalizar formato y recortar a la cantidad exacta pedida
      let mappedQuestions = questions.map(q => {
        if (q.text && !q.question) {
          const { text, ...rest } = q;
          return { ...rest, question: text };
        }
        return q;
      });
      if (options.count && mappedQuestions.length > options.count) {
        mappedQuestions = mappedQuestions.slice(0, options.count);
      }
  
      const gameData = {
        hostId: options.hostId,
        isPublic: options.isPublic,
        status: 'waiting',
        players: [{ uid: options.hostId, displayName: options.displayName, score: 0, responseTimes: [] }],
        questions: mappedQuestions,
        currentQuestion: 0,
        topic: options.topic || '',
        difficulty: options.difficulty || 'medium',
        createdAt: Date.now(),
        questionStartTimes: {} // Para almacenar cuándo se envió cada pregunta
      };
      await db.collection('games').doc(gameCode).set(gameData);
      socket.join(gameCode);
  socket.emit('gameCreated', { gameId: gameCode, questions: mappedQuestions, ...gameData });
    } catch (error) {

      socket.emit('error', { error: error.message });
    }
  });

  // Join Game
  socket.on('joinGame', async ({ gameId, uid, displayName }) => {
    try {
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const game = gameDoc.data();
      if (game.status !== 'waiting') {
        socket.emit('error', { error: 'Game already started' });
        return;
      }
      const alreadyJoined = game.players.some(p => p.uid === uid);
      if (!alreadyJoined) {
        game.players.push({ uid, displayName, score: 0, responseTimes: [] });
        await gameRef.update({ players: game.players });
      }
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', { players: game.players });
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Start Game
  socket.on('startGame', async ({ gameId }) => {
    try {
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const game = gameDoc.data();
      if (!game.questions || !Array.isArray(game.questions) || game.questions.length === 0) {
        socket.emit('error', { error: 'No hay preguntas asociadas a esta partida.' });
        return;
      }
      await gameRef.update({ status: 'in-progress' });
      io.to(gameId).emit('gameStarted', { questionsCount: game.questions.length });
      setTimeout(() => {
        sendQuestion(io, gameId, 0);
      }, 1000); // Espera 1 segundo antes de enviar la primera pregunta
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Submit Answer
  socket.on('submitAnswer', async ({ gameId, uid, answerIndex }) => {
    try {
      // Permitir recibir answerValue además de answerIndex
      let answerValue = undefined;
      if (typeof arguments[0] === 'object' && arguments[0] !== null && 'answerValue' in arguments[0]) {
        answerValue = arguments[0].answerValue;
      }
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        socket.emit('error', { error: 'Game not found' });
        return;
      }
      const game = gameDoc.data();
      const currentQ = game.questions[game.currentQuestion];
      if (!currentQ) {
        socket.emit('error', { error: 'No current question' });
        return;
      }
      if (!socket.data.answers) socket.data.answers = {};
      // Capturar el tiempo de respuesta
      const responseTime = Date.now();
      // Guardar ambos: índice, valor y tiempo de respuesta
      socket.data.answers[game.currentQuestion] = { answerIndex, answerValue, responseTime };
      socket.data.uid = uid;
      const sockets = await io.in(gameId).fetchSockets();
      const answers = {};
      sockets.forEach(s => {
        if (s.data.answers && s.data.answers[game.currentQuestion] !== undefined) {
          answers[s.data.uid] = s.data.answers[game.currentQuestion];
        }
      });
      // Solo avanzar si todos respondieron
      if (Object.keys(answers).length === game.players.length) {
        const correctValue = Array.isArray(currentQ.options) && typeof currentQ.correctAnswerIndex === 'number'
          ? currentQ.options[currentQ.correctAnswerIndex]
          : undefined;
        
        // Obtener el tiempo de inicio de la pregunta actual
        const questionStartTime = game.questionStartTimes && game.questionStartTimes[game.currentQuestion] 
          ? game.questionStartTimes[game.currentQuestion] 
          : Date.now();
        
        const updatedPlayers = game.players.map(player => {
          const ansObj = answers[player.uid];
          let score = player.score;
          let responseTimes = player.responseTimes || [];
          
          // Calcular el tiempo de respuesta para esta pregunta
          if (ansObj && ansObj.responseTime) {
            const responseTimeMs = ansObj.responseTime - questionStartTime;
            responseTimes.push(responseTimeMs);
          }
          
          // Validar por valor, y si no hay valor, por índice
          if (ansObj) {
            if (
              typeof ansObj.answerValue !== 'undefined' &&
              typeof correctValue !== 'undefined' &&
              ansObj.answerValue === correctValue
            ) {
              score += 1;
            } else if (
              typeof ansObj.answerIndex === 'number' &&
              typeof currentQ.correctAnswerIndex === 'number' &&
              ansObj.answerIndex === currentQ.correctAnswerIndex
            ) {
              score += 1;
            }
          }
          return { ...player, score, responseTimes };
        });
        await gameRef.update({ players: updatedPlayers });
        io.to(gameId).emit('answerResult', {
          correctAnswerIndex: currentQ.correctAnswerIndex,
          explanation: currentQ.explanation,
          players: updatedPlayers
        });
        const nextIndex = game.currentQuestion + 1;
        setTimeout(async () => {
          if (nextIndex < game.questions.length) {
            await gameRef.update({ currentQuestion: nextIndex });
            sendQuestion(io, gameId, nextIndex);
          } else {
            await gameRef.update({ status: 'finished' });
            io.to(gameId).emit('gameFinished', { players: updatedPlayers });

            // Guardar historial de partida para cada jugador
            const gameDocFinal = await gameRef.get();
            const finalGame = gameDocFinal.data();
            const now = new Date();
            const players = finalGame.players || [];
            const questionsCount = Array.isArray(finalGame.questions) ? finalGame.questions.length : 0;
            // Determinar el score más alto
            const maxScore = Math.max(...players.map(p => p.score));
            const playersWithMaxScore = players.filter(p => p.score === maxScore);
            
            // Función para calcular tiempo promedio de respuesta
            const calculateAverageResponseTime = (responseTimes) => {
              if (!responseTimes || responseTimes.length === 0) return Infinity;
              return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            };
            
            // Determinar ganador considerando empates por tiempo
            let winnerUid = null;
            if (playersWithMaxScore.length === 1) {
              // Solo un jugador con score máximo
              winnerUid = playersWithMaxScore[0].uid;
            } else if (playersWithMaxScore.length > 1 && maxScore > 0) {
              // Múltiples jugadores con score máximo - desempate por tiempo promedio
              let fastestPlayer = playersWithMaxScore[0];
              let fastestTime = calculateAverageResponseTime(fastestPlayer.responseTimes);
              
              for (let i = 1; i < playersWithMaxScore.length; i++) {
                const currentTime = calculateAverageResponseTime(playersWithMaxScore[i].responseTimes);
                if (currentTime < fastestTime) {
                  fastestTime = currentTime;
                  fastestPlayer = playersWithMaxScore[i];
                }
              }
              winnerUid = fastestPlayer.uid;
            }
            
            for (const player of players) {
              const result = player.uid === winnerUid && maxScore > 0
                ? 'win'
                : 'lose';
              // Determinar si el jugador fue host
              const isHost = finalGame.hostId === player.uid;
              await db.collection('gameResults').add({
                uid: player.uid,
                gameId: gameId,
                date: now.toISOString(),
                score: player.score,
                result,
                players: players.map(p => ({ uid: p.uid, displayName: p.displayName, score: p.score })),
                questionsCount,
                topic: finalGame.topic || '',
                difficulty: finalGame.difficulty || '',
                isHost
              });

              // Actualizar estadísticas del usuario, crear doc si no existe
              const userRef = db.collection('users').doc(player.uid);
              await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                let stats = { gamesPlayed: 0, wins: 0, correctAnswers: 0 };
                let baseUser = {};
                if (!userDoc.exists) {
                  // Si hay displayName/email en player, los guardamos
                  if (player.displayName) baseUser.displayName = player.displayName;
                  if (player.email) baseUser.email = player.email;
                  baseUser.stats = stats;
                  t.set(userRef, baseUser);

                } else {
                  stats = userDoc.data().stats || stats;
                  baseUser = userDoc.data();
                }
                const gamesPlayed = (stats.gamesPlayed || 0) + 1;
                const wins = (stats.wins || 0) + (result === 'win' ? 1 : 0);
                const correctAnswers = (stats.correctAnswers || 0) + (player.score || 0);
                t.set(userRef, { ...baseUser, stats: { gamesPlayed, wins, correctAnswers } }, { merge: true });

              });
            }
          }
        }, 3000);
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });
});

async function sendQuestion(io, gameId, questionIndex) {
  const gameRef = db.collection('games').doc(gameId);
  const gameDoc = await gameRef.get();
  if (!gameDoc.exists) return;
  const game = gameDoc.data();
  if (questionIndex >= game.questions.length) {
    io.to(gameId).emit('gameFinished', { players: game.players });
    await gameRef.update({ status: 'finished' });
    return;
  }
  
  // Capturar el timestamp cuando se envía la pregunta
  const questionStartTime = Date.now();
  const questionStartTimes = game.questionStartTimes || {};
  questionStartTimes[questionIndex] = questionStartTime;
  await gameRef.update({ questionStartTimes });
  
  let question = game.questions[questionIndex];
  // Solo adaptar el campo 'question' si viene como 'text', pero JAMÁS modificar options ni correctAnswerIndex
  if (question) {
    if (!question.question && question.text) {
      const { text, ...rest } = question;
      question = { ...rest, question: text };
    } else if (!question.question && !question.text) {
      io.to(gameId).emit('newQuestion', { question: { question: 'Error: pregunta sin texto', options: [], correctAnswerIndex: null }, index: questionIndex });
      return;
    }
    // Enviar la pregunta tal como está guardada (sin modificar options ni correctAnswerIndex)
    io.to(gameId).emit('newQuestion', { question, index: questionIndex });
  } else {
    io.to(gameId).emit('newQuestion', { question: { question: 'Error: pregunta no encontrada', options: [], correctAnswerIndex: null }, index: questionIndex });
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {

});

