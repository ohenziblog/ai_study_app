// =============== ユーザーエンティティ ===============
export namespace UserEntity {
  export interface User {
    userId: number;
    username: string;
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    role: string;
    settings: object;
  }

  export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }

  export interface UpdateUserDto {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  }

  // APIレスポンス用の安全なユーザー型（実際のエンティティと一致）
  export interface SafeUser {
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

  export interface UserSkillLevel {
    userId: number;
    skillId: number;
    skillLevel: number;
    confidence: number;
    totalAttempts: number;
    correctAttempts: number;
    lastAttemptAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
}

// =============== カテゴリーエンティティ ===============
export namespace CategoryEntity {
  export interface Category {
    categoryId: number;
    categoryName: string;
    description: string;
    parentId?: number;
    level: number;
    path?: string;
    createdAt: Date;
    updatedAt: Date;
    searchVector?: string;
  }

  export interface CreateCategoryDto {
    categoryName: string;
    description?: string;
    parentId?: number;
  }

  export interface UpdateCategoryDto {
    categoryName?: string;
    description?: string;
    parentId?: number;
  }
}

// =============== スキルエンティティ ===============
export namespace SkillEntity {
  export interface Skill {
    skillId: number;
    skillName: string;
    description: string;
    categoryId: number;
    difficulty: number;
    prerequisites?: string;
    learningObjectives?: string;
    createdAt: Date;
    updatedAt: Date;
    searchVector?: string;
  }

  export interface CreateSkillDto {
    skillName: string;
    description?: string;
    categoryId: number;
    difficulty?: number;
    prerequisites?: string;
    learningObjectives?: string;
  }

  export interface UpdateSkillDto {
    skillName?: string;
    description?: string;
    categoryId?: number;
    difficulty?: number;
    prerequisites?: string;
    learningObjectives?: string;
  }
}

// =============== 問題エンティティ ===============
export namespace QuestionEntity {
  export interface Question {
    questionId: number;
    questionHash: string;
    questionText: string;
    category: {
      id: number;
      name: string;
    };
    skill: {
      id: number;
      name: string;
    };
    difficulty: number;
  }

  export interface QuestionWithChoices extends Question {
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }

  // データベースから取得される実際のQuestionHistory構造
  export interface QuestionHistory {
    historyId: number;
    questionId: number;
    questionHash: string;
    questionText: string;
    options?: string; // JSONstring
    correctOptionIndex?: number;
    explanation?: string;
    isCorrect?: boolean;
    askedAt: Date;
    answeredAt?: Date;
    timeTaken?: number;
    userId: number;
    categoryId: number;
    skillId: number;
    // リレーション情報
    category?: {
      categoryId: number;
      categoryName: string;
    };
    skill?: {
      skillId: number;
      skillName: string;
    };
  }

  // APIレスポンス用の整形されたQuestionHistory
  export interface QuestionHistoryResponse {
    questionId: number;
    questionHash: string;
    questionText: string;
    options?: string[];
    correctOptionIndex?: number;
    explanation?: string;
    isCorrect?: boolean;
    askedAt: Date;
    answeredAt?: Date;
    category: {
      id: number;
      name: string;
    } | null;
    skill: {
      id: number;
      name: string;
    } | null;
  }

  export interface RecentQuestion {
    questionId: number;
    questionHash: string;
    questionText: string;
    options?: string;
    correctOptionIndex?: number;
    explanation?: string;
    isCorrect?: boolean;
    askedAt: Date;
    answeredAt?: Date;
    timeTaken?: number;
    userId: number;
    categoryId: number;
    skillId: number;
    createdAt: Date;
    updatedAt: Date;
  }
}

// =============== IRT関連エンティティ ===============
export namespace IRTEntity {
  export interface IRTParams {
    learningRate?: number;
    discriminationParam?: number;
    maxTheta?: number;
    minTheta?: number;
    maxDifficulty?: number;
    minDifficulty?: number;
  }

  export interface IRTCalculationResult {
    newAbility: number;
    abilityChange: number;
    confidence: number;
    probability: number;
  }

  export interface QuestionSummary {
    text: string;
    category: string;
  }
}

// =============== Express関連型 ===============
export namespace ExpressTypes {
  export interface AuthRequest {
    user?: UserEntity.User;
  }
}

// =============== HTTP関連型 ===============
export namespace HTTPTypes {
  export enum HTTP_STATUS {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_ERROR = 500
  }
}