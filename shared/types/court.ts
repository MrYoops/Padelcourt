// shared/types/court.ts
// Типы для корта и позиций

export interface Court {
  id: string;
  clubId: string;
  name: string;
  number: number;
  cameras: Camera[];
  status: CourtStatus;
  currentMatchId?: string;
}

export type CourtStatus = 'available' | 'occupied' | 'maintenance';

export interface Camera {
  id: string;
  courtId: string;
  position: CameraPosition;
  rtspUrl: string;
  isOnline: boolean;
}

export type CameraPosition = 'corner_1' | 'corner_2';

/**
 * Позиции игроков на корте
 * 
 *        СЕТКА
 *   ┌─────────────┐
 *   │  3      4   │  ← Team B (дальняя сторона)
 *   │             │
 *   │             │
 *   │  1      2   │  ← Team A (ближняя сторона)
 *   └─────────────┘
 *       КАМЕРА
 * 
 * 1 = Левый ближний (Team A, левый)
 * 2 = Правый ближний (Team A, правый)
 * 3 = Левый дальний (Team B, левый)
 * 4 = Правый дальний (Team B, правый)
 */
export type CourtPosition = 1 | 2 | 3 | 4;

export const POSITION_TO_TEAM: Record<CourtPosition, 'A' | 'B'> = {
  1: 'A',
  2: 'A',
  3: 'B',
  4: 'B',
};

export const POSITION_LABELS: Record<CourtPosition, string> = {
  1: 'Левый ближний',
  2: 'Правый ближний',
  3: 'Левый дальний',
  4: 'Правый дальний',
};

export const TEAM_POSITIONS: Record<'A' | 'B', CourtPosition[]> = {
  A: [1, 2],
  B: [3, 4],
};
