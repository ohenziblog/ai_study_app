// Backend 統一集約型インポートファイル
// すべての型をshared-typesから統一的にインポートし、バックエンド全体で利用

// ===== 名前空間を直接エクスポート =====
export type {
  // エンティティ関連名前空間
  UserEntity,
  CategoryEntity,
  SkillEntity,
  QuestionEntity,
  IRTEntity,
  ExpressTypes,
  HTTPTypes,
  
  // API関連名前空間
  AuthAPI,
  UserAPI,
  QuestionAPI,
  AnswerAPI,
  CategoryAPI,
  SkillAPI,
  
  // 状態管理関連名前空間
  AuthState,
  DashboardState,
  QuestionState,
  SubjectState,
  AppState
} from '@ai-study-app/shared-types';

// ===== よく使用される型のエイリアス =====
export type {
  // 基本API型
  ApiResponse,
  ValidationResult,
  
  // ユーザー関連
  User,
  SafeUser,
  UserSkillLevel,
  
  // 認証関連
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  
  // カテゴリー・スキル関連
  Category,
  Skill,
  
  // 問題関連
  Question,
  MultipleChoiceQuestion,
  QuestionWithChoices,
  QuestionHistory,
  
  // 回答関連
  AnswerRequest,
  MultipleChoiceAnswerRequest,
  AnswerResponse,
  MultipleChoiceAnswerResponse
} from '@ai-study-app/shared-types';

// ===== Backend特有の型エイリアス =====
// 既存コードとの互換性のために型エイリアスを追加
import type { AuthAPI, QuestionEntity } from '@ai-study-app/shared-types';
export type RegisterDTO = AuthAPI.RegisterRequest;
export type QuestionHistoryResponse = QuestionEntity.QuestionHistoryResponse;

// Express関連型（express.d.tsから移動）
export type { Request, Response, NextFunction, AuthRequest } from './express';
