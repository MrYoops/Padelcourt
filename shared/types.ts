/**
 * PadelSense — Общие типы данных
 * 
 * Используется в:
 * - mini-app (как JSDoc или при миграции на TS)
 * - backend (Pydantic schemas повторяют эту структуру)
 * - tablet-app (импорт напрямую)
 * 
 * ВАЖНО: При изменении — обновить во всех местах!
 */

// =============================================================================
// USER
// =============================================================================

export interface User {
  id: string;                    // UUID
  telegram_id: number | null;    // Telegram ID
  name: string;
  phone: string | null;
  photo_url: string | null;
  is_pro: boolean;
}

export interface UserCreate {
  telegram_id?: number | null;
  name: string;
  phone?: string | null;
  photo_url?: string | null;
}

// =============================================================================
// PLAYER (упрощённый User для планшета)
// =============================================================================

export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
}

// =============================================================================
// COURT POSITIONS
// =============================================================================

/**
 *          СЕТКА
 *    ┌───────┬───────┐
 *    │   1   │   2   │  ← Team A
 *    ├───────┼───────┤
 *    │   3   │   4   │  ← Team B
 *    └───────┴───────┘
 *         СТЕКЛО
 */
export type CourtPosition = 1 | 2 | 3 | 4;

export type CourtPositions = {
  [K in CourtPosition]: Player | null;
};

// =============================================================================
// QR CODE
// =============================================================================

export interface QRPayload {
  type: 'user';
  telegram_id: number;
}

export function parseQR(qrString: string): QRPayload | null {
  const match = qrString.match(/^user:(\d+)$/);
  if (!match) return null;
  return { type: 'user', telegram_id: parseInt(match[1], 10) };
}

export function generateQRString(telegramId: number): string {
  return `user:${telegramId}`;
}

// =============================================================================
// MATCH
// =============================================================================

export type MatchStatus = 'pending' | 'in_progress' | 'finished' | 'cancelled';

export interface Match {
  id: string;
  court_id: string;
  status: MatchStatus;
  positions: CourtPositions;
  score: MatchScore;
  started_at: string | null;
  finished_at: string | null;
  best_of: 1 | 2 | 3;
  created_at: string;
}

export interface MatchCreate {
  court_id: string;
  positions: CourtPositions;
  best_of?: 1 | 2 | 3;
}

// =============================================================================
// SCORE
// =============================================================================

export type GamePoint = 0 | 15 | 30 | 40 | 'AD';

export interface SetScore {
  teamA: number;
  teamB: number;
  tiebreak?: boolean;
}

export interface MatchScore {
  currentGame: { teamA: GamePoint; teamB: GamePoint };
  sets: SetScore[];
  serving: 'A' | 'B';
  currentSet: number;
}

export const INITIAL_SCORE: MatchScore = {
  currentGame: { teamA: 0, teamB: 0 },
  sets: [{ teamA: 0, teamB: 0 }],
  serving: 'A',
  currentSet: 0,
};

// =============================================================================
// SUBSCRIPTION
// =============================================================================

export type SubscriptionTier = 'free' | 'basic' | 'pro';

// =============================================================================
// TELEGRAM WEB APP
// =============================================================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}
