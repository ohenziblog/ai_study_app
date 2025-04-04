import crypto from 'crypto';
import type { User } from '../types/User';
import type { Question, QuestionHistory, QuestionHistoryResponse } from '../types/Question';
import { MoreThan, LessThan, Between } from 'typeorm'; // TypeORM演算子のインポートを追加

const { AppDataSource } = require('../config/DataSource');
const { RecentQuestion } = require('../models/RecentQuestion');
const { Category } = require('../models/Category');
const { Skill } = require('../models/Skill');
const logger = require('../utils/logger').default;

// リポジトリの取得
const recentQuestionRepository = AppDataSource.getRepository(RecentQuestion);
const categoryRepository = AppDataSource.getRepository(Category);
const skillRepository = AppDataSource.getRepository(Skill);

/**
 * 問題に関する操作を提供するサービス
 */
const questionService = {
  /**
   * ダミーの問題を生成する
   * @param userId ユーザーID
   * @param categoryId カテゴリID (オプション)
   * @param skillId スキルID (オプション)
   * @returns 生成された問題
   */
  generateQuestion: async (userId: number, categoryId?: number, skillId?: number): Promise<Question> => {
    try {
      // カテゴリとスキルの取得（指定がない場合はランダム）
      let category, skill;
      
      if (categoryId) {
        category = await categoryRepository.findOneBy({ category_id: categoryId });
      } else {
        // ランダムなカテゴリの取得
        const categories = await categoryRepository.find();
        category = categories[Math.floor(Math.random() * categories.length)];
      }
      
      if (skillId) {
        skill = await skillRepository.findOneBy({ skill_id: skillId });
      } else if (category) {
        // カテゴリに関連するスキルの取得
        const skills = await skillRepository.find({ where: { category_id: category.category_id } });
        if (skills.length > 0) {
          skill = skills[Math.floor(Math.random() * skills.length)];
        }
      }

      // ダミーの問題テキスト
      const questionTemplates = [
        `${category?.category_name || 'プログラミング'}における${skill?.skill_name || '基本概念'}について説明してください。`,
        `${skill?.skill_name || 'プログラミング'}の主な特徴を3つ挙げてください。`,
        `${category?.category_name || 'コンピュータサイエンス'}において${skill?.skill_name || 'アルゴリズム'}が重要である理由を述べてください。`,
        `${skill?.skill_name || 'データ構造'}の実際の応用例をいくつか挙げてください。`
      ];
      
      const questionText = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      
      // 問題ハッシュの生成
      const questionHash = crypto.createHash('sha256').update(questionText).digest('hex').substring(0, 64);
      
      // 問題の難易度（仮のランダム値）
      const difficulty = parseFloat((Math.random() * 3 + 1).toFixed(2)); // 1.00 - 4.00の範囲
      
      // 過去の出題履歴をチェック
      // ここでthisの参照が問題になっているので、直接関数を呼び出す形に変更
      const isDuplicate = await questionService.checkDuplicateQuestion(userId, questionHash);
      
      // 重複している場合は別の問題を再生成
      if (isDuplicate) {
        logger.info(`重複問題が検出されました。新しい問題を生成します: ${questionHash}`);
        // 同様にthisの参照を修正
        return questionService.generateQuestion(userId, categoryId, skillId);
      }
      
      // 問題履歴の保存
      const newQuestion = recentQuestionRepository.create({
        user_id: userId,
        question_hash: questionHash,
        question_text: questionText,
        difficulty,
        category_id: category?.category_id,
        skill_id: skill?.skill_id,
        askedAt: new Date()
      });
      
      await recentQuestionRepository.save(newQuestion);
      
      return {
        question_id: newQuestion.historyId,
        question_hash: questionHash,
        question_text: questionText,
        category: category ? {
          id: category.category_id,
          name: category.category_name
        } : undefined,
        skill: skill ? {
          id: skill.skill_id,
          name: skill.skill_name
        } : undefined,
        difficulty
      };
    } catch (error) {
      logger.error(`問題生成中にエラーが発生しました: ${error}`);
      throw error;
    }
  },
  
  /**
   * 過去の出題履歴をもとに重複問題をチェックする
   * @param userId ユーザーID
   * @param questionHash 問題ハッシュ
   * @returns 重複している場合はtrue
   */
  checkDuplicateQuestion: async (userId: number, questionHash: string): Promise<boolean> => {
    try {
      // 過去30日以内の同じハッシュの問題を検索
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // MoreThan演算子を使用することで、PostgreSQLの日付範囲検索を適切に行う
      const duplicateQuestion = await recentQuestionRepository.findOne({
        where: {
          user_id: userId,
          question_hash: questionHash,
          askedAt: MoreThan(thirtyDaysAgo)
        }
      });
      
      return !!duplicateQuestion;
    } catch (error) {
      logger.error(`重複問題チェック中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * ユーザーの最近の問題履歴を取得する
   * @param userId ユーザーID
   * @param limit 取得する履歴の数
   * @returns 最近の問題履歴
   */
  getUserRecentQuestions: async (userId: number, limit: number = 10): Promise<QuestionHistoryResponse[]> => {
    try {
      const questions = await recentQuestionRepository.find({
        where: { user_id: userId },
        order: { askedAt: 'DESC' },
        take: limit,
        relations: ['category', 'skill']
      });

      // 明示的な型を使用
      return questions.map((q: QuestionHistory) => ({
        question_id: q.historyId,
        question_hash: q.question_hash,
        question_text: q.question_text,
        asked_at: q.askedAt,
        answered_at: q.answeredAt,
        is_correct: q.is_correct,
        category: q.category ? {
          id: q.category.category_id,
          name: q.category.category_name
        } : null,
        skill: q.skill ? {
          id: q.skill.skill_id,
          name: q.skill.skill_name
        } : null
      }));
    } catch (error) {
      logger.error(`ユーザーの問題履歴取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

module.exports = questionService;
