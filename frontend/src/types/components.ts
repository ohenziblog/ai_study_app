// Frontend コンポーネント関連型集約ファイル
// React コンポーネントのプロパティ型を集約

// shared-typesからコンポーネント関連名前空間をインポート
export {
  CommonComponents,
  FormComponents,
  PageComponents,
  AuthComponents
} from '@ai-study-app/shared-types';

// ===== 共通コンポーネント型エイリアス =====
export type ButtonProps = CommonComponents.ButtonProps;
export type ButtonVariant = CommonComponents.ButtonVariant;
export type ButtonSize = CommonComponents.ButtonSize;
export type CardProps = CommonComponents.CardProps;
export type LayoutProps = CommonComponents.LayoutProps;

// ===== フォームコンポーネント型エイリアス =====
export type LoginFormProps = FormComponents.LoginFormProps;
export type RegisterFormProps = FormComponents.RegisterFormProps;

// ===== ページコンポーネント型エイリアス =====
export type DashboardProps = PageComponents.DashboardProps;
export type QuestionProps = PageComponents.QuestionProps;
export type SubjectCardProps = PageComponents.SubjectCardProps;
export type QuestionHistoryProps = PageComponents.QuestionHistoryProps;

// shared-typesから直接利用する型（命名規則統一後）
export type UserSkillLevelDisplay = PageComponents.UserSkillLevel;

// ===== 認証コンポーネント型エイリアス =====
export type AuthContextType = AuthComponents.AuthContextType;
export type ProtectedRouteProps = AuthComponents.ProtectedRouteProps;

// ===== Frontend特有の拡張型 =====
// React特有のプロパティを持つ拡張型
export interface ExtendedButtonProps extends ButtonProps {
  'data-testid'?: string;
  'aria-label'?: string;
}

export interface ExtendedCardProps extends CardProps {
  'data-testid'?: string;
  loading?: boolean;
  error?: string | null;
}

// フォーム関連の拡張型
export interface ExtendedLoginFormProps extends LoginFormProps {
  rememberMe?: boolean;
  forgotPasswordLink?: string;
}

export interface ExtendedRegisterFormProps extends RegisterFormProps {
  termsAccepted?: boolean;
  passwordConfirm?: string;
}

// ===== 便利な型ガード =====
export function isValidButtonVariant(variant: string): variant is ButtonVariant {
  return ['primary', 'secondary', 'outline', 'text'].includes(variant);
}

export function isValidButtonSize(size: string): size is ButtonSize {
  return ['sm', 'md', 'lg'].includes(size);
}
