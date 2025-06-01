// Frontend API関連型集約ファイル（改良版）
// APIリクエスト/レスポンス型とエンティティ型を集約

// ===== 名前空間型を集約 =====
export {
  // API関連名前空間
  AuthAPI,
  UserAPI,
  QuestionAPI,
  AnswerAPI,
  CategoryAPI,
  SkillAPI,
  
  // エンティティ関連名前空間
  QuestionEntity
} from '@ai-study-app/shared-types';

// ===== 直接アクセス型を集約 =====
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

// ===== Frontend特有のAPI型エイリアス =====
// API操作で使用頻度の高い型のエイリアス
export type LoginRequestDTO = AuthAPI.LoginRequest;
export type RegisterRequestDTO = AuthAPI.RegisterRequest;
export type AuthResponseDTO = AuthAPI.AuthResponse;

export type GetUserSkillLevelsDTO = UserAPI.GetUserSkillLevelsRequest;
export type UserSkillLevelResponseDTO = UserAPI.UserSkillLevelResponse;

export type GetQuestionDTO = QuestionAPI.GetQuestionRequest;
export type GenerateQuestionDTO = QuestionAPI.GenerateQuestionRequest;
export type QuestionHistoryRequestDTO = QuestionAPI.QuestionHistoryRequest;

export type AnswerRequestDTO = AnswerAPI.AnswerRequest;
export type MultipleChoiceAnswerRequestDTO = AnswerAPI.MultipleChoiceAnswerRequest;
export type AnswerResponseDTO = AnswerAPI.AnswerResponse;
export type MultipleChoiceAnswerResponseDTO = AnswerAPI.MultipleChoiceAnswerResponse;

// ===== 便利な型ガード関数 =====
export function isMultipleChoiceQuestion(question: any): question is QuestionEntity.QuestionWithChoices {
  return question && typeof question.correctOptionIndex === 'number' && Array.isArray(question.options);
}

export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && typeof response.success === 'boolean' && typeof response.message === 'string';
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; errors: string[] } {
  return response.success === false;
}

// ===== レガシー互換性エイリアス =====
// 既存コードとの互換性のための型エイリアス（段階的移行用）
export type Question_Legacy = QuestionEntity.QuestionWithChoices;
export type MultipleChoiceQuestion_Legacy = QuestionEntity.QuestionWithChoices;
