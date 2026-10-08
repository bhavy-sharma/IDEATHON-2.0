import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function useSocket() {
  const socketRef = useRef(null);
  const user = useUserStore((s) => s.user);
  
  const { 
    setStatus, setPlayers, setRoom, setCurrentQuestion, 
    setEndTime, setCorrectOptionId, setLeaderboard, setTeams, setMyTeamId 
  } = useGameStore();

  useEffect(() => {
    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // 🔥 YEH SABSE ZARURI HAI: Socket events ko Store se connect karo
    socket.on('roomJoined', (data) => {
      console.log("✅ Socket: Room Joined", data);
      setRoom(data.room);
      setPlayers(data.players);
      setStatus(data.room.status);
      if (data.room.mode === 'TEAM') {
        setTeams(data.teams || []);
      }
    });

    socket.on('playerJoined', (data) => {
      console.log("✅ Socket: Player Joined", data);
      setPlayers(data.players);
    });

    socket.on('gameStarted', (data) => {
      console.log("✅ Socket: Game Started", data);
      setStatus('ACTIVE');
      setCurrentQuestion(data.question);
      setEndTime(Date.now() + data.question.timeLimit * 1000);
    });

    socket.on('questionUpdate', (data) => {
      console.log("✅ Socket: Question Update", data);
      setCurrentQuestion(data.question);
      setEndTime(Date.now() + data.question.timeLimit * 1000);
      setCorrectOptionId(null); // Reset correct option for new question
    });

    socket.on('answerReveal', (data) => {
      console.log("✅ Socket: Answer Reveal", data);
      setStatus('REVEAL');
      setCorrectOptionId(data.correctOptionId);
      setLeaderboard(data.leaderboard);
    });

    socket.on('leaderboardUpdate', (data) => {
      console.log("✅ Socket: Leaderboard Update", data);
      setLeaderboard(data.leaderboard);
      if (data.teamLeaderboard) {
        // setTeamLeaderboard(data.teamLeaderboard); // Agar store mein hai toh
      }
    });

    socket.on('gameEnded', (data) => {
      console.log("✅ Socket: Game Ended", data);
      setStatus('ENDED');
      setLeaderboard(data.leaderboard);
    });

    return () => {
      socket.disconnect();
    };
  }, [setRoom, setPlayers, setStatus, setCurrentQuestion, setEndTime, setCorrectOptionId, setLeaderboard, setTeams]);

  // Actions to emit to server
  const joinRoom = (code, name) => {
    socketRef.current?.emit('joinRoom', { code, name, userId: user?.id });
  };

  const startGame = () => {
    socketRef.current?.emit('startGame');
  };

  const submitAnswer = (data) => {
    socketRef.current?.emit('submitAnswer', data);
  };

  const assignTeams = (teamsData) => {
    socketRef.current?.emit('assignTeams', teamsData);
  };

  return {
    isConnected: socketRef.current?.connected || false,
    joinRoom,
    startGame,
    submitAnswer,
    assignTeams,
  };
}