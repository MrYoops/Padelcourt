// shared/types/user.ts
// Общие типы пользователя для всех компонентов системы

export interface UserProfile {
  id: string;
  telegramId: number;
  name: string;
  phone?: string;
  avatarUrl?: string;
  qrCode: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'club';

export interface RegistrationData {
  telegramId: number;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

// API Request/Response
export interface CreateUserRequest {
  telegramId: number;
  name: string;
  phone?: string;
}

export interface CreateUserResponse {
  user: UserProfile;
  qrCode: string;
}

export interface GetUserResponse {
  user: UserProfile;
}
