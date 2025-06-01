export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare namespace AuthAPI {
    interface LoginRequest {
        email: string;
        password: string;
    }
    interface RegisterRequest {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }
    interface AuthResponse {
        user: SafeUser;
        token: string;
    }
    interface LoginRequestDTO {
        email: string;
        password: string;
    }
    interface RegisterDTO {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }
}
export declare namespace UserAPI {
    interface GetUserSkillLevelsRequest {
        userId: string;
    }
    interface UserSkillLevelResponse {
        skillId: number;
        skillName: string;
        categoryName: string;
        skillLevel: number;
        totalAttempts: number;
        correctAttempts: number;
    }
    interface CreateUserRequest {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        role?: string;
    }
    interface UpdateUserRequest {
        username?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
    }
}
export declare namespace QuestionAPI {
    interface GetQuestionRequest {
        categoryId?: number;
        skillId?: number;
    }
    interface QuestionHistoryRequest {
        limit?: number;
    }
    interface GenerateQuestionRequest {
        categoryId?: number;
        skillId?: number;
    }
}
export declare namespace AnswerAPI {
    interface AnswerRequest {
        questionId: number;
        answerIndex: number;
    }
    interface MultipleChoiceAnswerRequest {
        questionId: number;
        selectedOptionIndex: number;
        timeTaken?: number;
    }
    interface AnswerResponse {
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
    interface MultipleChoiceAnswerResponse {
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
export declare namespace CategoryAPI {
    interface GetAllCategoriesResponse {
        categories: Category[];
    }
    interface GetCategoryByIdResponse {
        category: Category;
    }
    interface GetCategorySkillsResponse {
        skills: Skill[];
    }
}
export declare namespace SkillAPI {
    interface GetAllSkillsResponse {
        skills: Skill[];
    }
    interface GetSkillsByCategory {
        categoryId: number;
    }
    interface GetSkillByIdResponse {
        skill: Skill;
    }
}
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
export interface QuestionHistory {
    questionId: number;
    questionText: string;
    category?: {
        id: number;
        name: string;
    };
    skill?: {
        id: number;
        name: string;
    };
    isCorrect: boolean | null;
    askedAt: string;
    answeredAt?: string;
    timeTaken?: number;
}
export interface UserSkillLevel {
    skillId: number;
    skillName: string;
    categoryName: string;
    skillLevel: number;
    totalAttempts: number;
    correctAttempts: number;
}
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
export interface Question {
    id: number;
    questionText: string;
    category?: {
        id: number;
        name: string;
    };
    skill?: {
        id: number;
        name: string;
    };
}
export interface MultipleChoiceQuestion extends Question {
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
}
export type QuestionWithChoices = MultipleChoiceQuestion;
export interface AnswerRequest {
    questionId: number;
    answerText: string;
    isCorrect: boolean;
    timeTaken?: number;
}
export interface MultipleChoiceAnswerRequest {
    questionId: number;
    selectedOptionIndex: number;
    choiceIndex?: number;
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
    isCorrect: boolean;
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
    isCorrect: boolean;
    skillLevel?: {
        skillId: number;
        skillName: string;
        level: number;
        confidence: number;
        totalAttempts: number;
        correctAttempts: number;
    };
}
