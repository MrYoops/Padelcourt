// shared/types/match.ts
// Общие типы матча для всех компонентов системы

import { CourtPosition } from './court';

export interface Match {
  id: string;
  courtId: string;
  players: MatchPlayer[];
  score: MatchScore;
  status: MatchStatus;
  format: MatchFormat;
  startedAt: Date | null;
  endedAt: Date | null;
  videoUrl?: string;
  highlightsUrl?: string;
  createdAt: Date;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  telegramId: number;
  name: string;
  avatarUrl?: string;
  position: CourtPosition;
  team: Team;
}

export type Team = 'A' | 'B';

export type MatchStatus = 
  | 'waiting_players'  // Ждём сканирования QR
  | 'ready'            // Все игроки на месте
  | 'in_progress'      // Матч идёт
  | 'paused'           // Пауза
  | 'finished'         // Завершён
  | 'cancelled';       // Отменён

export interface MatchFormat {
  sets: 1 | 2 | 3;
  gamesPerSet: 6;
  tiebreakAt: 6;
  finalSetTiebreak: boolean;
}

export interface MatchScore {
  sets: SetScore[];
  currentSet: number;
  currentGame: GameScore;
  winner?: Team;
}

export interface SetScore {
  teamA: number;
  teamB: number;
  winner?: Team;
  isTiebreak: boolean;
}

export interface GameScore {
  teamA: PointValue;
  teamB: PointValue;
}

export type PointValue = 0 | 15 | 30 | 40 | 'AD';

// API Request/Response
export interface CreateMatchRequest {
  courtId: string;
  format: MatchFormat;
}

export interface AddPlayerToMatchRequest {
  matchId: string;
  telegramId: number;
  position: CourtPosition;
  team: Team;
}

export interface UpdateScoreRequest {
  matchId: string;
  scoringTeam: Team;
}

export interface MatchSummary {
  match: Match;
  duration: number; // минуты
  totalPoints: number;
  highlights: Highlight[];
}

export interface Highlight {
  id: string;
  matchId: string;
  timestamp: number; // секунды от начала
  type: HighlightType;
  description?: string;
}

export type HighlightType = 
  | 'manual'          // Ручная метка
  | 'long_rally'      // Длинный розыгрыш
  | 'set_point'       // Сет-поинт
  | 'match_point'     // Матч-поинт
  | 'break_point';    // Брейк-поинт
