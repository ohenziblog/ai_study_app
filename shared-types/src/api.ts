// API応答の標準フォーマット
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// バリデーション結果を表す型
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// =============== Auth API ===============
export namespace AuthAPI {
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
    user: SafeUser;
    token: string;
  }

  export interface LoginRequestDTO {
    email: string;
    password: string;
  }

  export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }
}

// =============== User API ===============
export namespace UserAPI {
  export interface GetUserSkillLevelsRequest {
    userId: string;
  }

  export interface UserSkillLevelResponse {
    skill_id: number;
    skill_name: string;
    category_name: string;
    skill_level: number;
    total_attempts: number;
    correct_attempts: number;
  }

  export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }

  export interface UpdateUserRequest {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  }
}

// =============== Question API ===============
export namespace QuestionAPI {
  export interface GetQuestionRequest {
    categoryId?: number;
    skillId?: number;
  }

  export interface QuestionHistoryRequest {
    limit?: number;
  }

  export interface GenerateQuestionRequest {
    categoryId?: number;
    skillId?: number;
  }
}

// =============== Answer API ===============
export namespace AnswerAPI {
  export interface AnswerRequest {
    questionId: number;
    answerIndex: number;
  }

  export interface MultipleChoiceAnswerRequest {
    questionId: number;
    selectedOptionIndex: number;
    timeTaken?: number;
  }

  export interface AnswerResponse {
    questionId: number;
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    skillProgress?: {
      newLevel: number;
      levelChange: number;
      message: string;
    };
  }

  export interface MultipleChoiceAnswerResponse {
    question: {
      id: number;
      text: string;
      options: string[];
      selectedOptionIndex: number;
      correctOptionIndex: number;
      explanation: string;
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
}

// =============== Category API ===============
export namespace CategoryAPI {
  export interface GetAllCategoriesResponse {
    categories: Category[];
  }

  export interface GetCategoryByIdResponse {
    category: Category;
  }

  export interface GetCategorySkillsResponse {
    skills: Skill[];
  }
}

// =============== Skill API ===============
export namespace SkillAPI {
  export interface GetAllSkillsResponse {
    skills: Skill[];
  }

  export interface GetSkillsByCategory {
    categoryId: number;
  }

  export interface GetSkillByIdResponse {
    skill: Skill;
  }
}

// =============== 共通型の再エクスポート ===============
export interface SafeUser {
  user_id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  settings: object;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  level: number;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  difficulty: number;
  category?: {
    id: number;
    name: string;
  };
}

// =============== 追加の型定義 ===============

// ユーザー関連
export interface User {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  settings: object;
}

// 問題履歴
export interface QuestionHistory {
  question_id: number;
  question_text: string;
  category?: { id: number; name: string };
  skill?: { id: number; name: string };
  is_correct: boolean | null;
  asked_at: string;
  answered_at?: string;
  time_taken?: number;
}

// ユーザースキルレベル
export interface UserSkillLevel {
  skill_id: number;
  skill_name: string;
  category_name: string;
  skill_level: number;
  total_attempts: number;
  correct_attempts: number;
}

// 認証リクエスト/レスポンス
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

// 問題定義を修正
export interface Question {
  id: number;
  questionText: string;
  category?: { id: number; name: string };
  skill?: { id: number; name: string };
}

export interface MultipleChoiceQuestion extends Question {
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

// QuestionWithChoicesはMultipleChoiceQuestionのエイリアス
export type QuestionWithChoices = MultipleChoiceQuestion;

// 回答関連
export interface AnswerRequest {
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  timeTaken?: number;
}

export interface MultipleChoiceAnswerRequest {
  questionId: number;
  selectedOptionIndex: number;
  choiceIndex?: number; // 互換性のために追加
  timeTaken?: number;
}

export interface AnswerResponse {
  question: {
    id: number;
    text: string;
    isCorrect: boolean;
    askedAt: string;
    answeredAt: string;
    timeTaken: number;
  };
  isCorrect: boolean; // 直接アクセス用のプロパティを追加
  skillLevel?: {
    skillId: number;
    skillName: string;
    level: number;
    confidence: number;
    totalAttempts: number;
    correctAttempts: number;
  };
}

export interface MultipleChoiceAnswerResponse {
  question: {
    id: number;
    text: string;
    options: string[];
    selectedOptionIndex: number;
    correctOptionIndex: number;
    explanation: string;
    isCorrect: boolean;
    askedAt: string;
    answeredAt: string;
    timeTaken: number;
  };
  isCorrect: boolean; // 直接アクセス用のプロパティを追加
  skillLevel?: {
    skillId: number;
    skillName: string;
    level: number;
    confidence: number;
    totalAttempts: number;
    correctAttempts: number;
  };
}