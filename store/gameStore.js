import { create } from 'zustand';

const initialState = {
  room: null,
  players: [],
  status: 'LOBBY',

  // Question
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  endTime: null,

  // Answer state
  selectedOptionId: null,
  hasAnswered: false,
  correctOptionId: null,

  // Leaderboard (solo mode)
  leaderboard: [],

  // Teams
  mode: 'SOLO', // 'SOLO' | 'TEAM'
  teams: [], // [{ id, name, color, memberIds: [], score, rank }]
  myTeamId: null,

  // Team leaderboard
  teamLeaderboard: [], // [{ teamId, teamName, color, score, rank }]
};

export const useGameStore = create((set, get) => ({
  ...initialState,

  setRoom: (room) =>
    set({
      room,
      mode: room?.settings?.mode || 'SOLO',
    }),

  setPlayers: (players) => {
    const mode = get().mode;
    // In team mode, players have a teamId; group them
    if (mode === 'TEAM') {
      const byTeam = new Map();
      players.forEach((p) => {
        if (!p.teamId) return;
        if (!byTeam.has(p.teamId)) byTeam.set(p.teamId, []);
        byTeam.get(p.teamId).push(p);
      });
      set((state) => ({
        players,
        teams: state.teams.map((t) => ({
          ...t,
          memberIds: byTeam.get(t.id)?.map((p) => p.id) || [],
        })),
      }));
    } else {
      set({ players });
    }
  },

  setStatus: (status) => set({ status }),

  setQuestion: (question) =>
    set({
      currentQuestion: question,
      selectedOptionId: null,
      hasAnswered: false,
      correctOptionId: null,
    }),

  setQuestionIndex: (questionIndex) => set({ questionIndex }),
  setTotalQuestions: (totalQuestions) => set({ totalQuestions }),
  setEndTime: (endTime) => set({ endTime }),

  selectOption: (optionId) => {
    if (get().hasAnswered) return;
    set({ selectedOptionId: optionId });
  },

  markAnswered: () => set({ hasAnswered: true }),

  revealAnswer: (correctOptionId, leaderboard) =>
    set({ correctOptionId, leaderboard }),

  updatePlayerReady: (playerId, isReady) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, isReady } : p
      ),
    })),

  updateLeaderboard: (leaderboard) => set({ leaderboard }),

  // ---------- Teams ----------

  setTeams: (teams) => set({ teams }),

  setMyTeamId: (myTeamId) => set({ myTeamId }),

  setTeamLeaderboard: (teamLeaderboard) => set({ teamLeaderboard }),

  updateTeamScore: (teamId, score) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, score } : t
      ),
    })),

  reset: () => set(initialState),
}));