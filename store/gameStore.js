import { create } from 'zustand';

const initialState = {
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
};

export const useGameStore = create((set, get) => ({
  ...initialState,

  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
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

  reset: () => set(initialState),
}));