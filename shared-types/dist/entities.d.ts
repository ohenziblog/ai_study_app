export declare namespace UserEntity {
    interface User {
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
    interface CreateUserDto {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        role?: string;
    }
    interface UpdateUserDto {
        username?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
    }
    interface SafeUser {
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
    interface UserSkillLevel {
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
export declare namespace CategoryEntity {
    interface Category {
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
    interface CreateCategoryDto {
        categoryName: string;
        description?: string;
        parentId?: number;
    }
    interface UpdateCategoryDto {
        categoryName?: string;
        description?: string;
        parentId?: number;
    }
}
export declare namespace SkillEntity {
    interface Skill {
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
    interface CreateSkillDto {
        skillName: string;
        description?: string;
        categoryId: number;
        difficulty?: number;
        prerequisites?: string;
        learningObjectives?: string;
    }
    interface UpdateSkillDto {
        skillName?: string;
        description?: string;
        categoryId?: number;
        difficulty?: number;
        prerequisites?: string;
        learningObjectives?: string;
    }
}
export declare namespace QuestionEntity {
    interface Question {
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
    interface QuestionWithChoices extends Question {
        options: string[];
        correctOptionIndex: number;
        explanation: string;
    }
    interface QuestionHistory {
        historyId: number;
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
        category?: {
            categoryId: number;
            categoryName: string;
        };
        skill?: {
            skillId: number;
            skillName: string;
        };
    }
    interface QuestionHistoryResponse {
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
    interface RecentQuestion {
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
export declare namespace IRTEntity {
    interface IRTParams {
        learningRate?: number;
        discriminationParam?: number;
        maxTheta?: number;
        minTheta?: number;
        maxDifficulty?: number;
        minDifficulty?: number;
    }
    interface IRTCalculationResult {
        newAbility: number;
        abilityChange: number;
        confidence: number;
        probability: number;
    }
    interface QuestionSummary {
        text: string;
        category: string;
    }
}
export declare namespace ExpressTypes {
    interface AuthRequest {
        user?: UserEntity.User;
    }
}
export declare namespace HTTPTypes {
    enum HTTP_STATUS {
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
