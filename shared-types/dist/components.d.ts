export declare namespace CommonComponents {
    type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
    type ButtonSize = 'sm' | 'md' | 'lg';
    interface ButtonProps {
        variant?: ButtonVariant;
        size?: ButtonSize;
        isLoading?: boolean;
        children: any;
        className?: string;
        disabled?: boolean;
        onClick?: () => void;
        type?: 'button' | 'submit' | 'reset';
    }
    interface CardProps {
        title?: string;
        children: any;
        className?: string;
        onClick?: () => void;
    }
    interface LayoutProps {
        children: any;
    }
}
export declare namespace FormComponents {
    interface LoginFormProps {
        email: string;
        password: string;
        isLoading: boolean;
        onSubmit: (data: {
            email: string;
            password: string;
        }) => Promise<void>;
    }
    interface RegisterFormProps {
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
export declare namespace PageComponents {
    interface UserSkillLevel {
        skill_id: number;
        skill_name: string;
        category_name: string;
        skill_level: number;
        total_attempts: number;
        correct_attempts: number;
    }
    interface DashboardProps {
        user: any;
        skillLevels: UserSkillLevel[];
        recentHistory: any[];
        categories: any[];
        isLoading: boolean;
    }
    interface QuestionProps {
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
    interface SubjectCardProps {
        category: {
            id: number;
            name: string;
            description: string;
        };
        onClick: () => void;
    }
    interface QuestionHistoryProps {
        history: Array<{
            question_id: number;
            question_text: string;
            is_correct: boolean | null;
            asked_at: string;
            category?: {
                name: string;
            };
            skill?: {
                name: string;
            };
        }>;
        isLoading: boolean;
    }
}
export declare namespace AuthComponents {
    interface AuthContextType {
        user: any | null;
        isAuthenticated: boolean;
        isLoading: boolean;
        login: (data: any) => Promise<void>;
        register: (data: any) => Promise<void>;
        logout: () => void;
    }
    interface ProtectedRouteProps {
        children: any;
    }
}
