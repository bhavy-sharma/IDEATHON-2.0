// server.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const prisma = new PrismaClient();

// Redis Pub/Sub setup for Socket.IO scaling
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  console.log('✅ Redis Connected for Socket.IO Adapter');
}).catch(console.error);

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  adapter: createAdapter(pubClient, subClient),
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// 6-character unique room code generator
const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Fisher-Yates shuffle for options
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==========================================
// SOCKET.IO EVENTS
// ==========================================

io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  // 1. CREATE ROOM
  socket.on('create_room', async ({ hostId, questionSetId, collegeId, settings }) => {
    try {
      let code = generateRoomCode();
      let isUnique = false;
      
      // Ensure code is unique
      while (!isUnique) {
        const existing = await prisma.room.findUnique({ where: { code } });
        if (!existing) isUnique = true;
        else code = generateRoomCode();
      }

      const room = await prisma.room.create({
        data: {
          code,
          hostId,
          collegeId,
          questionSetId,
          settings: settings || { timeLimit: 15, shuffleOptions: true, wrongAnswerPenalty: -10 },
          status: 'LOBBY',
        },
      });

      socket.join(code);
      
      // Store room state in Redis for fast access
      await pubClient.hSet(`room:${code}`, {
        status: 'LOBBY',
        currentQuestionIndex: -1,
        questionStartTime: 0,
        questionEndTime: 0,
      });

      socket.emit('room_created', { roomCode: code, roomId: room.id });
    } catch (error) {
      console.error('Create room error:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // 2. JOIN ROOM
  socket.on('join_room', async ({ code, playerName, userId }) => {
    try {
      const room = await prisma.room.findUnique({ where: { code } });
      if (!room) return socket.emit('error', { message: 'Room not found' });
      if (room.status !== 'LOBBY') return socket.emit('error', { message: 'Game already started' });

      // Add player to DB
      const roomPlayer = await prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          userId: userId || null,
          guestName: userId ? null : playerName,
          score: 0,
          isReady: false,
        },
      });

      socket.join(code);
      socket.data = { roomId: room.id, playerId: roomPlayer.id, code };

      // Fetch updated players
      const players = await prisma.roomPlayer.findMany({
        where: { roomId: room.id },
        select: { id: true, guestName: true, user: { select: { name: true } }, score: true, isReady: true },
      });

      io.to(code).emit('room_updated', { players, status: room.status });
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // 3. TOGGLE READY
  socket.on('toggle_ready', async () => {
    const { roomId, playerId, code } = socket.data;
    if (!roomId) return;

    const player = await prisma.roomPlayer.findUnique({ where: { id: playerId } });
    const newReadyState = !player.isReady;

    await prisma.roomPlayer.update({
      where: { id: playerId },
      data: { isReady: newReadyState },
    });

    const players = await prisma.roomPlayer.findMany({
      where: { roomId },
      select: { id: true, guestName: true, user: { select: { name: true } }, score: true, isReady: true },
    });

    io.to(code).emit('room_updated', { players, status: 'LOBBY' });
  });

  // 4. START GAME (Server Authoritative)
  socket.on('start_game', async () => {
    const { roomId, code } = socket.data;
    
    try {
      // Fetch room with questions
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          questionSet: {
            include: {
              questions: {
                include: { options: true },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
          players: true,
        },
      });

      if (!room || room.questionSet.questions.length === 0) {
        return socket.emit('error', { message: 'No questions in this set' });
      }

      // Update room status
      await prisma.room.update({ where: { id: roomId }, data: { status: 'ACTIVE' } });
      await pubClient.hSet(`room:${code}`, 'status', 'ACTIVE');

      // Start Question 1
      startQuestion(room, 0, code);

    } catch (error) {
      console.error('Start game error:', error);
    }
  });

  // 5. SUBMIT ANSWER (Server Authoritative Validation)
  socket.on('submit_answer', async ({ questionId, selectedOptionId }) => {
    const { roomId, playerId, code } = socket.data;
    if (!roomId) return;

    try {
      // Get room state from Redis
      const roomState = await pubClient.hGetAll(`room:${code}`);
      const now = Date.now();
      const endTime = parseInt(roomState.questionEndTime);

      // 🛡️ ANTI-CHEAT: Time Validation (500ms grace period for network latency)
      if (now > endTime + 500) {
        socket.emit('answer_result', { status: 'TOO_LATE', message: 'Time is up!' });
        return;
      }

      // Fetch question to validate
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true },
      });

      const correctOption = question.options.find((opt) => opt.isCorrect);
      const isCorrect = correctOption.id === selectedOptionId;
      const responseTimeMs = now - parseInt(roomState.questionStartTime);

      // 🧮 SCORING FORMULA
      let scoreChange = 0;
      if (isCorrect) {
        const baseScore = 100;
        const timeLimitMs = question.timeLimit * 1000;
        const remainingTime = Math.max(0, timeLimitMs - responseTimeMs);
        const timeBonus = Math.floor((remainingTime / timeLimitMs) * 100);
        scoreChange = baseScore + timeBonus;
      } else {
        scoreChange = -10; // Penalty for wrong answer
      }

      // Update player score in DB
      await prisma.roomPlayer.update({
        where: { id: playerId },
        data: { score: { increment: scoreChange } },
      });

      // Record answer in DB (Batched or immediate, immediate for simplicity here)
      await prisma.answer.create({
        data: {
          roomId,
          playerId, // Note: Add playerId to Answer model if needed, or just use userId
          userId: socket.data.userId || 'guest',
          questionId,
          selectedOptionId,
          isCorrect,
          responseTimeMs,
        },
      });

      // Update Redis Leaderboard (Sorted Set)
      const player = await prisma.roomPlayer.findUnique({ where: { id: playerId } });
      await pubClient.zAdd(`leaderboard:${code}`, { score: player.score, value: playerId });

      socket.emit('answer_result', { 
        status: 'ACCEPTED', 
        isCorrect, 
        scoreChange,
        message: isCorrect ? 'Correct! + ' + scoreChange : 'Wrong! ' + scoreChange 
      });

    } catch (error) {
      console.error('Submit answer error:', error);
    }
  });

  // 6. DISCONNECT
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    // Optional: Handle reconnection logic here using socket.data
  });
});

// ==========================================
// GAME LOOP HELPER
// ==========================================
async function startQuestion(room, questionIndex, code) {
  const question = room.questionSet.questions[questionIndex];
  if (!question) {
    // Game Over
    await prisma.room.update({ where: { id: room.id }, data: { status: 'ENDED' } });
    io.to(code).emit('game_ended', { message: 'Game Over!' });
    
    // Fetch final leaderboard
    const finalScores = await pubClient.zRevRangeWithScores(`leaderboard:${code}`, 0, -1);
    io.to(code).emit('final_leaderboard', { leaderboard: finalScores });
    return;
  }

  const timeLimitMs = question.timeLimit * 1000;
  const startTime = Date.now();
  const endTime = startTime + timeLimitMs;

  // Save state to Redis
  await pubClient.hSet(`room:${code}`, {
    currentQuestionIndex: questionIndex,
    questionStartTime: startTime,
    questionEndTime: endTime,
    currentQuestionId: question.id,
  });

  // Prepare payload for each player (Shuffle options if enabled)
  const players = room.players;
  players.forEach((player) => {
    let options = question.options;
    let correctOptionId = question.options.find((opt) => opt.isCorrect).id;

    if (room.settings.shuffleOptions) {
      options = shuffleArray(options);
    }

    // Emit to specific player with their shuffled options
    io.to(player.id).emit('question_start', {
      questionId: question.id,
      text: question.text,
      imageUrl: question.imageUrl,
      tableData: question.tableData,
      options: options.map((opt) => ({ id: opt.id, text: opt.text })), // Don't send isCorrect to client!
      timeLimit: question.timeLimit,
      endTime: endTime, // Server tells client when time ends
      questionNumber: questionIndex + 1,
      totalQuestions: room.questionSet.questions.length,
    });
  });

  // ⏱️ SERVER-SIDE TIMER: Auto-reveal after timeLimit
  setTimeout(async () => {
    // Reveal Answer
    const correctOption = question.options.find((opt) => opt.isCorrect);
    
    // Get live leaderboard from Redis
    const topPlayers = await pubClient.zRevRangeWithScores(`leaderboard:${code}`, 0, 9);
    
    // Map Redis IDs to player names for the UI
    const leaderboardWithNames = await Promise.all(
      topPlayers.map(async (entry) => {
        const p = await prisma.roomPlayer.findUnique({ 
          where: { id: entry.value },
          select: { guestName: true, user: { select: { name: true } } }
        });
        return {
          name: p?.user?.name || p?.guestName || 'Unknown',
          score: entry.score,
        };
      })
    );

    io.to(code).emit('question_reveal', {
      questionId: question.id,
      correctOptionId: correctOption.id,
      leaderboard: leaderboardWithNames,
    });

    // Wait 5 seconds, then next question
    setTimeout(() => {
      startQuestion(room, questionIndex + 1, code);
    }, 5000);

  }, timeLimitMs + 500); // +500ms grace period buffer
}

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Game Engine running on port ${PORT}`);
});