// shared/types/api.ts
// API контракты — единый источник правды для всех компонентов

// ============================================
// БАЗОВЫЕ ТИПЫ
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * API Endpoints Reference
 * Base URL: /api/v1
 * 
 * USERS
 * POST   /users                    - Создать пользователя
 * GET    /users/:telegramId        - Получить пользователя по Telegram ID
 * PATCH  /users/:telegramId        - Обновить пользователя
 * GET    /users/:telegramId/qr     - Получить QR-код
 * 
 * MATCHES
 * POST   /matches                  - Создать матч
 * GET    /matches/:id              - Получить матч
 * POST   /matches/:id/players      - Добавить игрока
 * DELETE /matches/:id/players/:pos - Удалить игрока с позиции
 * POST   /matches/:id/start        - Начать матч
 * PATCH  /matches/:id/score        - Обновить счёт
 * POST   /matches/:id/highlight    - Добавить хайлайт
 * POST   /matches/:id/pause        - Пауза
 * POST   /matches/:id/resume       - Продолжить
 * POST   /matches/:id/finish       - Завершить
 * 
 * COURTS
 * GET    /courts                   - Список кортов
 * GET    /courts/:id               - Информация о корте
 * GET    /courts/:id/status        - Статус корта
 */

// ============================================
// USER ENDPOINTS
// ============================================

// POST /users
export interface CreateUserRequest {
  telegramId: number;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CreateUserResponse {
  id: string;
  telegramId: number;
  name: string;
  qrCode: string;
  createdAt: string;
}

// GET /users/:telegramId
export interface GetUserResponse {
  id: string;
  telegramId: number;
  name: string;
  phone?: string;
  avatarUrl?: string;
  qrCode: string;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'club';
  stats: UserStats;
  createdAt: string;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

// ============================================
// MATCH ENDPOINTS
// ============================================

// POST /matches
export interface CreateMatchRequest {
  courtId: string;
  format: {
    sets: 1 | 2 | 3;
  };
}

export interface CreateMatchResponse {
  id: string;
  courtId: string;
  status: 'waiting_players';
  createdAt: string;
}

// POST /matches/:id/players
export interface AddPlayerRequest {
  telegramId: number;
  position: 1 | 2 | 3 | 4;
}

export interface AddPlayerResponse {
  player: {
    id: string;
    telegramId: number;
    name: string;
    avatarUrl?: string;
    position: 1 | 2 | 3 | 4;
    team: 'A' | 'B';
  };
  matchStatus: 'waiting_players' | 'ready';
  playersCount: number;
}

// PATCH /matches/:id/score
export interface UpdateScoreRequest {
  scoringTeam: 'A' | 'B';
}

export interface UpdateScoreResponse {
  score: {
    sets: Array<{
      teamA: number;
      teamB: number;
      winner?: 'A' | 'B';
    }>;
    currentGame: {
      teamA: 0 | 15 | 30 | 40 | 'AD';
      teamB: 0 | 15 | 30 | 40 | 'AD';
    };
  };
  matchStatus: 'in_progress' | 'finished';
  winner?: 'A' | 'B';
}

// POST /matches/:id/highlight
export interface AddHighlightRequest {
  timestamp: number; // секунды от начала матча
  type?: 'manual' | 'long_rally' | 'set_point' | 'match_point';
  description?: string;
}

// ============================================
// QR CODE FORMAT
// ============================================

/**
 * Формат QR-кода для идентификации игрока
 * 
 * Формат: "user:{telegram_id}"
 * Пример: "user:123456789"
 * 
 * Регулярное выражение для парсинга: /^user:(\d+)$/
 */
export const QR_CODE_PREFIX = 'user:';
export const QR_CODE_REGEX = /^user:(\d+)$/;

export const generateQRCodeData = (telegramId: number): string => {
  return `${QR_CODE_PREFIX}${telegramId}`;
};

export const parseQRCodeData = (data: string): number | null => {
  const match = data.match(QR_CODE_REGEX);
  return match ? parseInt(match[1], 10) : null;
};

// ============================================
// WEBSOCKET EVENTS (для real-time обновлений)
// ============================================

export type WSEventType = 
  | 'match:player_joined'
  | 'match:player_left'
  | 'match:started'
  | 'match:score_updated'
  | 'match:highlight_added'
  | 'match:paused'
  | 'match:resumed'
  | 'match:finished';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  matchId: string;
  data: T;
  timestamp: string;
}
