// Frontend 統一集約型インポートファイル
// すべての型をshared-typesから統一的にインポートし、フロントエンド全体で利用

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
  AppState,
  
  // コンポーネント関連名前空間
  CommonComponents,
  FormComponents,
  PageComponents,
  AuthComponents
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

// ===== Frontend特有の型拡張 =====
// React Query / SWR用の状態拡張
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isValidating?: boolean;
  mutate?: () => void;
}

// フォーム状態拡張型
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ページネーション状態型
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== 便利な型ガード関数 =====
// 注意: このファイルでQuestionEntityを直接使用するにはimportが必要
import type { QuestionEntity } from '@ai-study-app/shared-types';

export function isMultipleChoiceQuestion(question: any): question is QuestionEntity.QuestionWithChoices {
  return question && typeof question.correctOptionIndex === 'number' && Array.isArray(question.options);
}

export function isLoadingState<T>(state: AsyncState<T>): boolean {
  return state.isLoading;
}

export function hasError<T>(state: AsyncState<T>): boolean {
  return state.error !== null;
}

export function hasData<T>(state: AsyncState<T>): state is AsyncState<T> & { data: T } {
  return state.data !== null;
}