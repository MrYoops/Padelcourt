/**
 * PadelSense — Tablet App Types
 * Импортированы из shared/types.ts
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
