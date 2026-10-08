'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { toast } from '@/components/ui/use-toast';
import { saveReconnectToken } from '@/hooks/useReconnect';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const accessToken = useUserStore((s) => s.accessToken);

  const {
    // Core game
    setPlayers,
    setStatus,
    setQuestion,
    setQuestionIndex,
    setTotalQuestions,
    setEndTime,
    revealAnswer,
    updatePlayerReady,
    setRoom,

    // Teams
    setTeams,
    setMyTeamId,
    setTeamLeaderboard,
    updateTeamScore,
  } = useGameStore();

  // ============================================
  // Initialize socket connection
  // ============================================

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

    // ---------- Connection lifecycle ----------

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

    // ---------- Room ----------

    socket.on('room_state', (data) => {
      if (data.room) setRoom(data.room);
      setPlayers(data.players || []);
      setStatus(data.status);
      setQuestionIndex(data.currentQuestionIndex ?? 0);
      setTotalQuestions(data.totalQuestions ?? 0);

      if (data.currentQuestion) {
        setQuestion(data.currentQuestion);
      }

      // Hydrate teams if provided
      if (data.teams) setTeams(data.teams);
      if (data.myTeamId) setMyTeamId(data.myTeamId);
    });

    socket.on('room_error', (data) => {
      toast({
        title: 'Room error',
        description: data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    });

    // ---------- Questions ----------

    socket.on('question_start', (data) => {
      setQuestion({
        id: data.questionId,
        text: data.text,
        options: data.options,
        imageUrl: data.imageUrl,
        tableData: data.tableData,
        timeLimit: data.timeLimit,
        topic: data.topic || '',
        difficulty: data.difficulty || 'MEDIUM',
        createdAt: new Date().toISOString(),
      });
      setQuestionIndex(data.questionIndex ?? 0);
      setTotalQuestions(data.totalQuestions ?? 0);
      setEndTime(data.endTime);
      setStatus('ACTIVE');
    });

    socket.on('question_reveal', (data) => {
      revealAnswer(data.correctOptionId, data.leaderboard || []);
      setStatus('REVEAL');
    });

    // ---------- Players ----------

    socket.on('player_ready_updated', (data) => {
      updatePlayerReady(data.playerId, data.isReady);
    });

    socket.on('player_joined', (data) => {
      // Optional: toast when someone joins
      if (data?.name) {
        toast({
          title: 'Player joined',
          description: data.name,
        });
      }
    });

    // ---------- Teams ----------

    socket.on('teams_assigned', ({ teams, myTeamId }) => {
      setTeams(teams || []);
      if (myTeamId) setMyTeamId(myTeamId);

      const myTeam = (teams || []).find((t) => t.id === myTeamId);
      if (myTeam) {
        toast({
          title: 'Teams assigned!',
          description: `You're on ${myTeam.name}.`,
        });
      }
    });

    socket.on('team_leaderboard_update', ({ teamLeaderboard }) => {
      setTeamLeaderboard(teamLeaderboard || []);
    });

    socket.on('team_score_updated', ({ teamId, score }) => {
      updateTeamScore(teamId, score);
    });

    // ---------- Game end ----------

    socket.on('game_ended', (data) => {
      setStatus('ENDED');
      if (data?.teamLeaderboard) {
        setTeamLeaderboard(data.teamLeaderboard);
      }
    });

    // ---------- Reconnect token ----------

    socket.on('reconnect_token', ({ roomCode, token }) => {
      saveReconnectToken(roomCode, token);
    });

    // ---------- Cleanup ----------

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [
    accessToken,
    setRoom,
    setPlayers,
    setStatus,
    setQuestion,
    setQuestionIndex,
    setTotalQuestions,
    setEndTime,
    revealAnswer,
    updatePlayerReady,
    setTeams,
    setMyTeamId,
    setTeamLeaderboard,
    updateTeamScore,
  ]);

  // ============================================
  // Emit helpers
  // ============================================

  const joinRoom = useCallback((code, name) => {
    socketRef.current?.emit('join_room', { code, name });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave_room');
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

  const assignTeams = useCallback((teams) => {
    socketRef.current?.emit('assign_teams', { teams });
  }, []);

  // ============================================
  // Return
  // ============================================

  return {
    socket: socketRef.current,
    isConnected,
    // Actions
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    submitAnswer,
    syncState,
    assignTeams,
  };
}