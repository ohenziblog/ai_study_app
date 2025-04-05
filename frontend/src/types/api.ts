// API応答の標準型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// ユーザー関連の型
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
}

// 認証関連の型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// カテゴリー関連の型
export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
  level: number;
}

// スキル関連の型
export interface Skill {
  id: number;
  name: string;
  description: string;
  category_id: number;
  difficulty: number;
  category?: {
    id: number;
    name: string;
  };
}

// 問題関連の型
export interface Question {
  question_id: number;
  question_hash: string;
  question_text: string;
  category?: {
    id: number;
    name: string;
  };
  skill?: {
    id: number;
    name: string;
  };
  difficulty: number;
}

// 回答関連の型
export interface AnswerRequest {
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  timeTaken?: number;
}

export interface AnswerResponse {
  question: {
    id: number;
    text: string;
    answer: string;
    isCorrect: boolean;
    askedAt: string;
    answeredAt: string;
    timeTaken: number;
  };
  skillLevel?: {
    skillId: number;
    skillName: string;
    level: number;
    confidence: number;
    totalAttempts: number;
    correctAttempts: number;
  };
}
