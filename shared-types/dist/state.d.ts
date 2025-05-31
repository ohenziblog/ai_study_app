export declare namespace AuthState {
    interface AuthState {
        user: User | null;
        isAuthenticated: boolean;
        isLoading: boolean;
        error: string | null;
    }
    interface User {
        userId: number;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        isActive: boolean;
    }
}
export declare namespace DashboardState {
    interface DashboardState {
        skillLevels: UserSkillLevel[];
        recentHistory: QuestionHistory[];
        categories: Category[];
        isLoading: boolean;
        error: string | null;
    }
    interface UserSkillLevel {
        skill_id: number;
        skill_name: string;
        category_name: string;
        skill_level: number;
        total_attempts: number;
        correct_attempts: number;
    }
    interface QuestionHistory {
        question_id: number;
        question_text: string;
        is_correct: boolean | null;
        asked_at: string;
        answered_at?: string;
        category?: {
            id: number;
            name: string;
        };
        skill?: {
            id: number;
            name: string;
        };
    }
    interface Category {
        id: number;
        name: string;
        description: string;
        parentId?: number;
        level: number;
    }
}
export declare namespace QuestionState {
    interface QuestionState {
        currentQuestion: Question | null;
        isLoading: boolean;
        isSubmitting: boolean;
        error: string | null;
        lastAnswer: AnswerResult | null;
    }
    interface Question {
        questionId: number;
        questionHash: string;
        questionText: string;
        options?: string[];
        correctOptionIndex?: number;
        explanation?: string;
        difficulty: number;
        category: {
            id: number;
            name: string;
        };
        skill: {
            id: number;
            name: string;
        };
    }
    interface AnswerResult {
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
    interface QuestionHistoryState {
        history: QuestionHistory[];
        isLoading: boolean;
        error: string | null;
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
        };
    }
    interface QuestionHistory {
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
}
export declare namespace SubjectState {
    interface SubjectState {
        categories: Category[];
        skills: Skill[];
        selectedCategory: Category | null;
        selectedSkill: Skill | null;
        isLoading: boolean;
        error: string | null;
    }
    interface Category {
        id: number;
        name: string;
        description: string;
        parentId?: number;
        level: number;
        skillCount?: number;
    }
    interface Skill {
        id: number;
        name: string;
        description: string;
        categoryId: number;
        difficulty: number;
        category?: {
            id: number;
            name: string;
        };
        userLevel?: number;
        userProgress?: {
            totalAttempts: number;
            correctAttempts: number;
            lastAttemptAt?: Date;
        };
    }
}
export declare namespace AppState {
    interface RootState {
        auth: AuthState.AuthState;
        dashboard: DashboardState.DashboardState;
        question: QuestionState.QuestionState;
        questionHistory: QuestionState.QuestionHistoryState;
        subject: SubjectState.SubjectState;
        ui: UIState;
    }
    interface UIState {
        theme: 'light' | 'dark';
        sidebarOpen: boolean;
        notifications: Notification[];
        loading: {
            global: boolean;
            api: boolean;
        };
    }
    interface Notification {
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        title?: string;
        autoClose?: boolean;
        duration?: number;
        createdAt: Date;
    }
}
