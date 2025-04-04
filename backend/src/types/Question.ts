/**
 * 問題に関する型定義
 */
export interface Question {
  question_id: number;
  question_hash: string;
  question_text: string;
  difficulty: number;
  category?: {
    id: number;
    name: string;
  };
  skill?: {
    id: number;
    name: string;
  };
}

/**
 * 履歴取得用の問題型（リレーション含む）
 */
export interface QuestionHistory {
  historyId: number;
  question_hash: string;
  question_text: string;
  askedAt: Date;
  answeredAt?: Date;
  is_correct?: boolean;
  category?: {
    category_id: number;
    category_name: string;
  };
  skill?: {
    skill_id: number;
    skill_name: string;
  };
}

/**
 * 問題履歴の戻り値型
 */
export interface QuestionHistoryResponse {
  question_id: number;
  question_hash: string;
  question_text: string;
  asked_at: Date;
  answered_at?: Date;
  is_correct?: boolean;
  category: {
    id: number;
    name: string;
  } | null;
  skill: {
    id: number;
    name: string;
  } | null;
}
