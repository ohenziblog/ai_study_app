// =============== 共通コンポーネント型 ===============
export namespace CommonComponents {
  // Button コンポーネント
  export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
  export type ButtonSize = 'sm' | 'md' | 'lg';

  export interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    children: any; // ReactNode の代わり
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }

  // Card コンポーネント
  export interface CardProps {
    title?: string;
    children: any; // ReactNode の代わり
    className?: string;
    onClick?: () => void;
  }

  // Layout コンポーネント
  export interface LayoutProps {
    children: any; // ReactNode の代わり
  }
}

// =============== フォーム関連コンポーネント型 ===============
export namespace FormComponents {
  export interface LoginFormProps {
    email: string;
    password: string;
    isLoading: boolean;
    onSubmit: (data: { email: string; password: string }) => Promise<void>;
  }

  export interface RegisterFormProps {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isLoading: boolean;
    onSubmit: (data: {
      username: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => Promise<void>;
  }
}

// =============== ページ固有コンポーネント型 ===============
export namespace PageComponents {
  // Dashboard コンポーネント
  export interface UserSkillLevel {
    skill_id: number;
    skill_name: string;
    category_name: string;
    skill_level: number;
    total_attempts: number;
    correct_attempts: number;
  }

  export interface DashboardProps {
    user: any; // AuthContext から取得
    skillLevels: UserSkillLevel[];
    recentHistory: any[];
    categories: any[];
    isLoading: boolean;
  }

  // Question コンポーネント
  export interface QuestionProps {
    question: {
      questionId: number;
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
    };
    onAnswer: (selectedIndex: number) => Promise<void>;
    isLoading: boolean;
  }

  // SubjectList コンポーネント
  export interface SubjectCardProps {
    category: {
      id: number;
      name: string;
      description: string;
    };
    onClick: () => void;
  }

  // QuestionHistory コンポーネント
  export interface QuestionHistoryProps {
    history: Array<{
      question_id: number;
      question_text: string;
      is_correct: boolean | null;
      asked_at: string;
      category?: { name: string };
      skill?: { name: string };
    }>;
    isLoading: boolean;
  }
}

// =============== 認証関連コンポーネント型 ===============
export namespace AuthComponents {
  export interface AuthContextType {
    user: any | null; // User型は entities.ts で定義
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>; // LoginRequest型は api.ts で定義
    register: (data: any) => Promise<void>; // RegisterRequest型は api.ts で定義
    logout: () => void;
  }

  export interface ProtectedRouteProps {
    children: any; // ReactNode の代わり
  }
}