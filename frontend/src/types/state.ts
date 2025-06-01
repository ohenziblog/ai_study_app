// Frontend 状態管理関連型集約ファイル
// React状態管理（Context、Redux、Zustand等）で利用する型を集約

// shared-typesから状態管理関連名前空間をインポート
export {
  AuthState,
  DashboardState,
  QuestionState,
  SubjectState,
  AppState
} from '@ai-study-app/shared-types';

// ===== 認証状態型エイリアス =====
export type AuthStateType = AuthState.AuthState;
export type LoginState = AuthState.LoginState;
export type RegisterState = AuthState.RegisterState;

// ===== ダッシュボード状態型エイリアス =====
export type DashboardStateType = DashboardState.DashboardState;
export type UserSkillLevelState = DashboardState.UserSkillLevel;
export type QuestionHistoryState = DashboardState.QuestionHistory;

// ===== 問題・学習状態型エイリアス =====
export type QuestionStateType = QuestionState.QuestionState;
export type QuestionType = QuestionState.Question;
export type AnswerResult = QuestionState.AnswerResult;
export type QuestionHistoryStateType = QuestionState.QuestionHistoryState;
export type QuestionHistoryType = QuestionState.QuestionHistory;

// ===== カテゴリー・スキル状態型エイリアス =====
export type SubjectStateType = SubjectState.SubjectState;
export type CategoryType = SubjectState.Category;
export type SkillType = SubjectState.Skill;

// ===== アプリケーション全体状態型エイリアス =====
export type RootState = AppState.RootState;
export type UIState = AppState.UIState;
export type Notification = AppState.Notification;

// ===== Frontend特有の状態拡張型 =====
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

// ===== Context用の状態型 =====
// 認証Context状態型
export interface AuthContextState extends AuthStateType {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ダッシュボードContext状態型
export interface DashboardContextState extends DashboardStateType {
  refreshUserSkillLevels: () => Promise<void>;
  refreshQuestionHistory: () => Promise<void>;
  updateSkillLevel: (skillId: number, newLevel: number) => void;
}

// 問題Context状態型
export interface QuestionContextState extends QuestionStateType {
  fetchQuestion: (categoryId?: number, skillId?: number) => Promise<void>;
  submitAnswer: (answer: any) => Promise<void>;
  nextQuestion: () => Promise<void>;
  resetQuestionState: () => void;
}

// ===== 便利な型ガード =====
export function isLoadingState<T>(state: AsyncState<T>): boolean {
  return state.isLoading;
}

export function hasError<T>(state: AsyncState<T>): boolean {
  return state.error !== null;
}

export function hasData<T>(state: AsyncState<T>): state is AsyncState<T> & { data: T } {
  return state.data !== null;
}
