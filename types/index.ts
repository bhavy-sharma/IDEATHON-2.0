// ============================================
// Core Enums
// ============================================

export type UserRole = 'ADMIN' | 'HOST' | 'PLAYER' | 'SPECTATOR';
export type RoomStatus = 'LOBBY' | 'ACTIVE' | 'REVEAL' | 'ENDED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// ============================================
// User & Auth
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId: string;
  college?: College;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ============================================
// Questions
// ============================================

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean; // Only present for host/admin
}

export interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: Difficulty;
  imageUrl?: string;
  tableData?: Record<string, unknown>;
  timeLimit: number;
  options: Option[];
  questionSetId?: string;
  createdAt: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  questions: Question[];
  createdAt: string;
}

// ============================================
// Rooms & Game
// ============================================

export interface RoomSettings {
  timeLimit: number;
  scoringMode: 'STANDARD' | 'TEAM';
  mode: 'SOLO' | 'TEAM';
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  collegeId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  settings: RoomSettings;
  questionSetId: string;
}

export interface RoomPlayer {
  id: string;
  roomId: string;
  userId?: string;
  name: string;
  score: number;
  isReady: boolean;
  joinedAt: string;
}

// ============================================
// Socket Events (Client → Server)
// ============================================

export interface JoinRoomPayload {
  code: string;
  name: string;
  token?: string;
}

export interface SubmitAnswerPayload {
  questionId: string;
  optionId: string;
  clientTimestamp: number;
}

// ============================================
// Socket Events (Server → Client)
// ============================================

export interface RoomStatePayload {
  players: RoomPlayer[];
  status: RoomStatus;
  currentQuestion?: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export interface QuestionStartPayload {
  questionId: string;
  text: string;
  options: Option[];
  imageUrl?: string;
  tableData?: Record<string, unknown>;
  timeLimit: number;
  endTime: number;
  questionIndex: number;
  totalQuestions: number;
}

export interface QuestionRevealPayload {
  correctOptionId: string;
  leaderboard: LeaderboardEntry[];
}

export interface PlayerReadyPayload {
  playerId: string;
  isReady: boolean;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

// ============================================
// Analytics
// ============================================

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  avgResponseTimeMs: number;
}

export interface RoomAnalytics {
  roomId: string;
  totalPlayers: number;
  averageScore: number;
  questionStats: QuestionAnalytics[];
}