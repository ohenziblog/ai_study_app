// shared-typesから型をインポート
export type {
  User,
  Category,
  Skill,
  QuestionHistory,
  UserSkillLevel,
  SafeUser,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  QuestionWithChoices,
  AnswerRequest,
  MultipleChoiceAnswerRequest,
  AnswerResponse,
  MultipleChoiceAnswerResponse,
  ApiResponse
} from '@ai-study-app/shared-types';

import { QuestionEntity } from '@ai-study-app/shared-types';

// 便利な型ガード関数をエクスポート
export function isMultipleChoiceQuestion(question: any): question is QuestionEntity.QuestionWithChoices {
  return question && typeof question.correctOptionIndex === 'number' && Array.isArray(question.options);
}

// レガシーな型名のエイリアス（既存コードとの互換性のため）
export type Question = QuestionEntity.QuestionWithChoices;
export type MultipleChoiceQuestion = QuestionEntity.QuestionWithChoices;
