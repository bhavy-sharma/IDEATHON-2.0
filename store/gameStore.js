import { create } from 'zustand';

export const useGameStore = create((set) => ({
  room: null,
  players: [],
  status: 'LOBBY', // LOBBY, ACTIVE, REVEAL, ENDED
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  endTime: null,
  selectedOptionId: null,
  hasAnswered: false,
  correctOptionId: null,
  leaderboard: [],
  mode: 'SOLO', // SOLO or TEAM
  teams: [],
  myTeamId: null,
  teamLeaderboard: [],

  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  setStatus: (status) => set({ status }),
  setCurrentQuestion: (question) => set({ 
    currentQuestion: question, 
    hasAnswered: false, 
    selectedOptionId: null 
  }),
  setEndTime: (endTime) => set({ endTime }),
  setCorrectOptionId: (id) => set({ correctOptionId: id }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setTeams: (teams) => set({ teams }),
  setMyTeamId: (id) => set({ myTeamId: id }),
  
  selectOption: (optionId) => set({ selectedOptionId: optionId }),
  markAnswered: () => set({ hasAnswered: true }),
  
  reset: () => set({
    room: null,
    players: [],
    status: 'LOBBY',
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    endTime: null,
    selectedOptionId: null,
    hasAnswered: false,
    correctOptionId: null,
    leaderboard: [],
    mode: 'SOLO',
    teams: [],
    myTeamId: null,
    teamLeaderboard: [],
  }),
}));