import { type EntityManager } from 'typeorm';
import crypto from 'crypto';
import { MoreThan, LessThan, Between, In } from 'typeorm';
import type { Question, QuestionHistory, QuestionHistoryResponse, QuestionWithChoices } from '../types/Question';

const { AppDataSource } = require('../config/DataSource');
const { RecentQuestion } = require('../models/RecentQuestion');
const { Category } = require('../models/Category');
const { Skill } = require('../models/Skill');
const { UserSkillLevel } = require('../models/UserSkillLevel');
const deepseekService = require('./ai/deepseekService');
const irtService = require('./irtService');
const logger = require('../utils/logger').default;

// リポジトリの取得
const recentQuestionRepository = AppDataSource.getRepository(RecentQuestion);
const categoryRepository = AppDataSource.getRepository(Category);
const skillRepository = AppDataSource.getRepository(Skill);
const userSkillLevelRepository = AppDataSource.getRepository(UserSkillLevel);

// 必要な型定義
interface QuestionSummary {
  text: string;
  category: string;
}

/**
 * キャッシュキーを生成する（10分単位）
 * @param userId ユーザーID
 * @returns キャッシュキー
 */
const generateCacheKey = (userId: number): string => {
  const now = new Date();
  // 分を10分単位に丸める（0-9 -> 0, 10-19 -> 10, 20-29 -> 20, ...）
  const minutes = Math.floor(now.getMinutes() / 10) * 10;
  // HH:MM形式に整形（分は10分単位）
  const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return `user_${userId}_${timeString}`;
};

/**
 * 問題に関する操作を提供するサービス
 */
const questionService = {
  /**
   * AIを使用して問題を生成する
   * @param userId ユーザーID
   * @param categoryId カテゴリID (オプション)
   * @param skillId スキルID (オプション)
   * @returns 生成された問題
   */
  generateQuestion: async (
    userId: number, 
    categoryId?: number, 
    skillId?: number
  ): Promise<QuestionWithChoices> => {
    try {
      // カテゴリとスキルの選択
      const { category, skill } = await questionService.selectCategoryAndSkill(userId, categoryId, skillId);
      
      if (!category || !skill) {
        throw new Error('適切なカテゴリまたはスキルが見つかりませんでした');
      }

      // ユーザーエンティティの取得
      const userEntity = await AppDataSource.getRepository('User').findOneBy({ userId: userId });
      if (!userEntity) {
        throw new Error(`ユーザーID ${userId} が見つかりません`);
      }

      // ユーザーのスキルレベルを取得 - リレーションを通して検索
      let userSkillLevel = await userSkillLevelRepository.findOne({
        where: {
          user: { userId: userId },
          skill: { skillId: skill.skillId }
        }
      });

      // スキルレベルが存在しない場合は新規作成
      const userTheta = userSkillLevel ? userSkillLevel.skillLevel : 0.0;
      
      // ユーザーの能力に合わせた最適な難易度を推定
      // 初心者には少し簡単に（正答率80%）、上級者には少し難しく（正答率65%）
      const targetProbability = 0.8 - (Math.max(0, userTheta) * 0.05);
      const targetDifficulty = irtService.estimateOptimalDifficulty(userTheta, targetProbability);
      
      // 過去の問題から三層アプローチでデータを取得
      const { 
        recentSummaries, 
        structuredKeywords, 
        olderKeywords 
      } = await questionService.getPastQuestionsData(userId, skill.skillId, category.categoryId);
      
      logger.info(`問題生成に使用する過去データ: 
        最近の問題要約: ${recentSummaries.length}個, 
        構造化キーワード: ${Object.keys(structuredKeywords).length}カテゴリ, 
        古いキーワード: ${olderKeywords.length}個`);
      
      // DeepSeekサービスを使用して問題を生成
      const generatedQuestion = await deepseekService.generateQuestion(
        category,
        skill,
        targetDifficulty,
        recentSummaries,
        structuredKeywords,
        olderKeywords
      );

      // 問題の抽象化ハッシュを生成
      const abstractHash = await deepseekService.generateAbstractHash(
        generatedQuestion.question,
        generatedQuestion.options
      );
      
      // 問題の簡潔な要約を生成（次回以降の類似問題回避に使用）
      const questionSummary = await deepseekService.generateQuestionSummary(
        generatedQuestion.question,
        generatedQuestion.options
      );
      
      // 問題履歴の保存 - リレーションを通してエンティティを設定
      const newQuestion = recentQuestionRepository.create({
        user: userEntity,
        questionHash: generatedQuestion.hash,
        questionText: generatedQuestion.question,
        abstractHash: abstractHash,
        questionSummary: questionSummary,
        difficulty: generatedQuestion.difficulty,
        category: category,
        skill: skill,
        options: JSON.stringify(generatedQuestion.options),
        correctOptionIndex: generatedQuestion.correctAnswerIndex,
        explanation: generatedQuestion.explanation,
        askedAt: new Date()
      });
      
      await recentQuestionRepository.save(newQuestion);
      
      // 返り値をキャメルケースに統一
      return {
        questionId: newQuestion.historyId,
        questionHash: generatedQuestion.hash,
        questionText: generatedQuestion.question,
        options: generatedQuestion.options,
        correctOptionIndex: generatedQuestion.correctAnswerIndex,
        explanation: generatedQuestion.explanation,
        category: {
          id: category.categoryId,
          name: category.categoryName
        },
        skill: {
          id: skill.skillId,
          name: skill.skillName
        },
        difficulty: generatedQuestion.difficulty
      };
    } catch (error) {
      logger.error(`問題生成中にエラーが発生しました: ${error}`);
      
      // エラー時には簡易的な問題を返す（フォールバック）
      return questionService.generateSimpleQuestion(userId, categoryId, skillId);
    }
  },

  /**
   * 三層アプローチで過去の問題データを取得する
   * @param userId ユーザーID
   * @param skillId 現在のスキルID
   * @param categoryId 現在のカテゴリID
   * @returns 過去の問題データ（最近の要約、中期構造化キーワード、古いキーワード）
   */
  getPastQuestionsData: async (
    userId: number,
    skillId: number,
    categoryId: number
  ): Promise<{
    recentSummaries: QuestionSummary[];
    structuredKeywords: Record<string, string[]>;
    olderKeywords: string[];
  }> => {
    try {
      // 全てのデータを一度に取得することで、複数のクエリ実行を避ける
      const allRecentQuestions = await recentQuestionRepository.find({
        select: ['historyId', 'questionSummary', 'abstractHash', 'askedAt'],
        where: { user: { userId: userId } },
        order: { askedAt: 'DESC' },
        take: 50, // 必要な最大数
        relations: ['category', 'skill']
      });
      // キャッシュキー（ユーザーIDと10分単位のタイムスタンプの組み合わせ）
      const cacheKey = generateCacheKey(userId); // 10分単位のキャッシュキーを生成
      const dataCache = (global as any).pastDataCache || new Map();
      (global as any).pastDataCache = dataCache;
      
      // キャッシュにデータがある場合は返す（10分以内に同じユーザーが複数の問題を解く場合に有効）
      if (dataCache.has(cacheKey)) {
        logger.debug('過去問題データをキャッシュから取得しました');
        return dataCache.get(cacheKey);
      }
      
      // 1. 最近の問題（最大5件）- 問題要約を使用
      const recentSummaries: QuestionSummary[] = allRecentQuestions
        .slice(0, 5)
        .filter((q: any) => q.questionSummary) // 要約がある問題のみ
        .map((q: any) => ({
          text: q.questionSummary,
          category: q.category ? q.category.categoryName : '不明'
        }));
      // 2. 中期の問題（6-20件目）- カテゴリ別の構造化キーワード
      const midRangeQuestions = allRecentQuestions.slice(5, 20);
      let structuredKeywords: Record<string, string[]> = {};
      
     // カテゴリごとにキーワードを集約
      midRangeQuestions.forEach((q: any) => {
        if (q.abstractHash && !q.abstractHash.includes('-') && q.category) {
          const categoryName = q.category.categoryName;
          if (!structuredKeywords[categoryName]) {
            structuredKeywords[categoryName] = [];
          }
          
          // キーワードを分割して追加（重複を避ける）
          const keywords = q.abstractHash.split(',').map((k: string) => k.trim());
          keywords.forEach((keyword: string) => {
            if (keyword && !structuredKeywords[categoryName].includes(keyword)) {
              structuredKeywords[categoryName].push(keyword);
            }
          });
        }
      });
      
      // 3. 古い問題（21-50件目）- シンプルなキーワードクラウド
      const olderQuestions = allRecentQuestions.slice(20, 50);
      const olderKeywordSet = new Set<string>();
      
      olderQuestions.forEach((q: any) => {
        if (q.abstractHash && !q.abstractHash.includes('-')) {
          const keywords = q.abstractHash.split(',').map((k: string) => k.trim());
          keywords.forEach((keyword: string) => {
            if (keyword) {
              olderKeywordSet.add(keyword);
            }
          });
        }
      });
      
      // 現在のカテゴリを優先順位を上げる（配列の並び替え）
      if (categoryId) {
        const currentCategoryQuestions = midRangeQuestions.filter((q: any) => 
          q.category && q.category.categoryId === categoryId
        );
        
        // 現在のカテゴリに関するキーワードを優先して追加
        if (currentCategoryQuestions.length > 0 && currentCategoryQuestions[0].category) {
          const categoryName = currentCategoryQuestions[0].category.categoryName;
          
          // 既存のキーワードリストを移動して先頭に持ってくる
          if (structuredKeywords[categoryName]) {
            const temp = structuredKeywords[categoryName];
            delete structuredKeywords[categoryName];
            
            // 新しいオブジェクトを作成して、現在のカテゴリを先頭に
            const newStructuredKeywords: Record<string, string[]> = { [categoryName]: temp };
            
            // 他のキーワードも追加
            Object.entries(structuredKeywords).forEach(([key, value]) => {
              newStructuredKeywords[key] = value;
            });
            
            // 新しい構造化キーワードを使用
            structuredKeywords = newStructuredKeywords;
          }
        }
      }
      
      // 結果をオブジェクトにまとめる
      const result = {
        recentSummaries,
        structuredKeywords,
        olderKeywords: Array.from(olderKeywordSet)
      };
      
      // キャッシュに保存（最大100エントリまで）
      if (dataCache.size >= 100) {
        const firstKey = dataCache.keys().next().value;
        dataCache.delete(firstKey);
      }
      dataCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      logger.error(`過去の問題データ取得中にエラーが発生しました: ${error}`);
      return {
        recentSummaries: [],
        structuredKeywords: {},
        olderKeywords: []
      };
    }
  },

  /**
   * カテゴリとスキルを選択する
   * @param userId ユーザーID
   * @param categoryId カテゴリID (オプション)
   * @param skillId スキルID (オプション)
   * @returns 選択されたカテゴリとスキル
   */
  selectCategoryAndSkill: async (userId: number, categoryId?: number, skillId?: number) => {
    let category, skill;
    
    try {
      // カテゴリとスキルの取得（指定がない場合はIRTに基づいて選択）
      if (categoryId) {
        // カテゴリIDが指定されている場合
        category = await categoryRepository.findOneBy({ categoryId: categoryId });
        if (!category) {
          throw new Error(`指定されたカテゴリID: ${categoryId} が見つかりませんでした`);
        }
      } else {
        // カテゴリをランダムに選択
        const categories = await categoryRepository.find();
        if (categories.length === 0) {
          throw new Error('カテゴリが見つかりませんでした');
        }
        category = categories[Math.floor(Math.random() * categories.length)];
      }
      
      if (skillId) {
        // スキルIDが指定されている場合、カテゴリリレーションを含めて取得
        skill = await skillRepository.findOne({
          where: { skillId: skillId },
          relations: ['category']
        });
        if (!skill) {
          throw new Error(`指定されたスキルID: ${skillId} が見つかりませんでした`);
        }
        
        // スキルが指定されたカテゴリに属していることを確認
        if (categoryId && skill.category?.categoryId !== category.categoryId) {
          throw new Error(`指定されたスキルはこのカテゴリに属していません`);
        }
      } else if (category) {
        // ユーザーの苦手スキルを優先的に選択
        const skills = await skillRepository.find({ 
          where: { category: { categoryId: category.categoryId } },
          relations: ['category']
        });
        
        if (skills.length === 0) {
          throw new Error(`カテゴリID: ${category.categoryId} に関連するスキルが見つかりませんでした`);
        }
        
        // ユーザーのスキルレベルを取得
        const userSkillLevels = await userSkillLevelRepository.find({
          where: {
            userId: userId,
            skillId: In(skills.map((s: any) => s.skillId))
          }
        });
        
        if (userSkillLevels.length > 0) {
          // スキルレベルが低い（苦手な）スキルを優先（70%の確率）
          if (Math.random() < 0.7) {
            // スキルレベルの低い順にソート
            userSkillLevels.sort((a: any, b: any) => a.skillLevel - b.skillLevel);
            
            // 上位30%の中からランダムに選択
            const lowSkillLevels = userSkillLevels.slice(0, Math.max(1, Math.floor(userSkillLevels.length * 0.3)));
            const selectedSkillLevel = lowSkillLevels[Math.floor(Math.random() * lowSkillLevels.length)];
            
            skill = skills.find((s: any) => s.skillId === selectedSkillLevel.skillId);
          } else {
            // 30%の確率でランダムなスキルを選択
            skill = skills[Math.floor(Math.random() * skills.length)];
          }
        } else {
          // スキルレベルがない場合はランダムに選択
          skill = skills[Math.floor(Math.random() * skills.length)];
        }
      }
      
      return { category, skill };
    } catch (error) {
      logger.error(`カテゴリとスキルの選択中にエラーが発生しました: ${error}`);
      throw error;
    }
  },
  
  /**
   * 簡易的な問題を生成する（AIエラー時のフォールバック）
   * @param userId ユーザーID
   * @param categoryId カテゴリID (オプション)
   * @param skillId スキルID (オプション)
   * @returns 生成された簡易問題
   */
  generateSimpleQuestion: async (
    userId: number, 
    categoryId?: number, 
    skillId?: number
  ): Promise<QuestionWithChoices> => {
    try {
      // カテゴリとスキルの取得（指定がない場合はランダム）
      const { category, skill } = await questionService.selectCategoryAndSkill(
        userId, categoryId, skillId
      );
      
      if (!category || !skill) {
        throw new Error('カテゴリまたはスキルが見つかりませんでした');
      }

      // ユーザーエンティティの取得
      const userEntity = await AppDataSource.getRepository('User').findOneBy({ userId: userId });
      if (!userEntity) {
        throw new Error(`ユーザーID ${userId} が見つかりません`);
      }

      // ダミーの問題テンプレート
      const questionTemplates = [
        {
          question: `${category.categoryName}における${skill.skillName}の主要な概念は何ですか？`,
          options: [
            `${skill.skillName}の基本原理`,
            `${skill.skillName}の応用例`,
            `${skill.skillName}と関連する分野`,
            `${skill.skillName}の歴史的背景`
          ],
          correctIndex: 0
        },
        {
          question: `${skill.skillName}の特徴として最も適切なものはどれですか？`,
          options: [
            `体系的な構造と一貫性`,
            `複雑な概念と抽象的な表現`,
            `実践的な応用と具体例`,
            `歴史的発展と変遷`
          ],
          correctIndex: 2
        },
        {
          question: `${category.categoryName}において${skill.skillName}が重要である主な理由は何ですか？`,
          options: [
            `基礎概念の理解に役立つから`,
            `実用的な応用が多いから`,
            `他の分野との関連性が高いから`,
            `歴史的に重要な発見があったから`
          ],
          correctIndex: 1
        }
      ];
      
      // ランダムなテンプレートを選択
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      
      // 問題ハッシュの生成
      const questionHash = crypto.randomUUID();
      const abstractHash = crypto.createHash('sha256')
        .update(template.question)
        .digest('hex')
        .substring(0, 64);
      
      // 問題の要約を生成
      const questionSummary = `${skill.skillName}の基本概念に関する問題`;
      
      // 問題の難易度（中程度の難易度）
      const difficulty = 2.5;
      
      // 問題履歴の保存 - リレーションを通してエンティティを設定
      const newQuestion = recentQuestionRepository.create({
        user: userEntity,
        questionHash: questionHash,
        abstractHash: abstractHash,
        questionText: template.question,
        questionSummary: questionSummary,
        options: JSON.stringify(template.options),
        correctOptionIndex: template.correctIndex,
        explanation: `この問題は${skill.skillName}の基本的な理解を確認するためのものです。`,
        difficulty,
        category: category,
        skill: skill,
        askedAt: new Date()
      });
      
      await recentQuestionRepository.save(newQuestion);
      
      // 返り値をキャメルケースに統一
      return {
        questionId: newQuestion.historyId,
        questionHash: questionHash,
        questionText: template.question,
        options: template.options,
        correctOptionIndex: template.correctIndex,
        explanation: `この問題は${skill.skillName}の基本的な理解を確認するためのものです。`,
        category: {
          id: category.categoryId,
          name: category.categoryName
        },
        skill: {
          id: skill.skillId,
          name: skill.skillName
        },
        difficulty
      };
    } catch (error) {
      logger.error(`簡易問題生成中にエラーが発生しました: ${error}`);
      throw error;
    }
  },
  
  /**
   * ユーザーの問題履歴を取得する
   * @param userId ユーザーID
   * @param limit 取得する履歴の数
   * @returns 問題履歴
   */
  getQuestionHistory: async (userId: number, limit: number = 10): Promise<QuestionHistoryResponse[]> => {
    try {
      const questions = await recentQuestionRepository.find({
        where: { user: { userId: userId } },
        order: { askedAt: 'DESC' },
        take: limit,
        relations: ['category', 'skill', 'user']
      });

      // マッピング処理をキャメルケースに統一
      return questions.map((q: any) => ({
        questionId: q.historyId,
        questionHash: q.questionHash,
        questionText: q.questionText,
        askedAt: q.askedAt,
        answeredAt: q.answeredAt,
        isCorrect: q.isCorrect,
        // 選択肢があれば含める
        options: q.options ? JSON.parse(q.options) : [],
        correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : -1,
        explanation: q.explanation || '',
        category: q.category ? {
          id: q.category.categoryId,
          name: q.category.categoryName
        } : null,
        skill: q.skill ? {
          id: q.skill.skillId,
          name: q.skill.skillName
        } : null
      }));
    } catch (error) {
      logger.error(`ユーザーの問題履歴取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

module.exports = questionService;
