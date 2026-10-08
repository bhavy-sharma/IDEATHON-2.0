'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const accessToken = useUserStore((s) => s.accessToken);

  const {
    setPlayers,
    setStatus,
    setQuestion,
    setQuestionIndex,
    setTotalQuestions,
    setEndTime,
    revealAnswer,
    updatePlayerReady,
  } = useGameStore();

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setIsConnected(false);
    });

    // ---------- Server → Client ----------

    socket.on('room_state', (data) => {
      setPlayers(data.players);
      setStatus(data.status);
      setQuestionIndex(data.currentQuestionIndex);
      setTotalQuestions(data.totalQuestions);
      if (data.currentQuestion) setQuestion(data.currentQuestion);
    });

    socket.on('question_start', (data) => {
      setQuestion({
        id: data.questionId,
        text: data.text,
        options: data.options,
        imageUrl: data.imageUrl,
        tableData: data.tableData,
        timeLimit: data.timeLimit,
        topic: '',
        difficulty: 'MEDIUM',
        createdAt: new Date().toISOString(),
      });
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setEndTime(data.endTime);
      setStatus('ACTIVE');
    });

    socket.on('question_reveal', (data) => {
      revealAnswer(data.correctOptionId, data.leaderboard);
      setStatus('REVEAL');
    });

    socket.on('player_ready_updated', (data) => {
      updatePlayerReady(data.playerId, data.isReady);
    });

    socket.on('game_ended', () => setStatus('ENDED'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    accessToken,
    setPlayers,
    setStatus,
    setQuestion,
    setQuestionIndex,
    setTotalQuestions,
    setEndTime,
    revealAnswer,
    updatePlayerReady,
  ]);

  // ---------- Client → Server ----------

  const joinRoom = useCallback((code, name) => {
    socketRef.current?.emit('join_room', { code, name });
  }, []);

  const toggleReady = useCallback(() => {
    socketRef.current?.emit('toggle_ready');
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('start_game');
  }, []);

  const submitAnswer = useCallback(({ questionId, optionId }) => {
    socketRef.current?.emit('submit_answer', {
      questionId,
      optionId,
      clientTimestamp: Date.now(),
    });
  }, []);

  const syncState = useCallback((reconnectToken) => {
    socketRef.current?.emit('sync_state', { token: reconnectToken });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    toggleReady,
    startGame,
    submitAnswer,
    syncState,
  };
}