// フロントエンドとバックエンド間の問題関連の型定義

// 問題の基本情報
export interface Question {
  question_id: number;
  question_hash: string;
  question_text: string;
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

// 選択肢付き問題
export interface QuestionWithChoices extends Question {
  options: string[];
  correct_option_index: number;
  explanation: string;
}

// 問題履歴の基本情報
export interface QuestionHistory {
  historyId: number;
  userId: number;
  questionHash: string;
  questionText: string;
  questionSummary?: string; // 問題の簡潔な要約（類似問題検出用）
  abstractHash?: string;    // 問題の抽象化ハッシュ（類似問題検出用）
  difficulty: number;
  categoryId?: number;      // カテゴリID
  skillId?: number;         // スキルID
  options?: string;         // JSONとして保存された選択肢
  correctOptionIndex?: number;
  explanation?: string;
  userAnswerIndex?: number;
  isCorrect?: boolean;
  askedAt: Date;
  answeredAt?: Date;
  answerText?: string;      // 回答テキスト
  answeredAtTz?: Date;      // タイムゾーン付きの回答日時
  timeTaken?: number;       // 回答にかかった時間
  selectedOptionIndex?: number; // 選択された選択肢のインデックス
  category?: any;           // リレーションで取得されるカテゴリ情報
  skill?: any;              // リレーションで取得されるスキル情報
}

// クライアントに返す問題履歴の情報
export interface QuestionHistoryResponse {
  question_id: number;
  question_hash: string;
  question_text: string;
  options?: string[];        // パース済みの選択肢
  correct_option_index?: number;
  explanation?: string;
  is_correct?: boolean;
  asked_at: Date;
  answered_at?: Date;
  category: {
    id: number;
    name: string;
  } | null;
  skill: {
    id: number;
    name: string;
  } | null;
}

// ユーザーからの回答リクエスト
export interface AnswerRequest {
  question_id: number;
  answer_index: number;
}

// 回答結果のレスポンス
export interface AnswerResponse {
  question_id: number;
  is_correct: boolean;
  correct_option_index: number;
  explanation: string;
  skill_progress?: {
    new_level: number;
    level_change: number;
    message: string;
  };
}

// 問題生成のリクエスト
export interface GenerateQuestionRequest {
  category_id?: number;
  skill_id?: number;
}
