// 変数名を変更して名前衝突を避ける
const dataSource = require('../config/DataSource').AppDataSource;
const RecentQuestion = require('../models/RecentQuestion').RecentQuestion;
const UserSkillLevel = require('../models/UserSkillLevel').UserSkillLevel;
const irtService = require('./irtService');
const answerServiceLogger = require('../utils/logger').default;  // 変数名を変更

// リポジトリの取得
const recentQuestionRepository = dataSource.getRepository(RecentQuestion);
const userSkillLevelRepository = dataSource.getRepository(UserSkillLevel);

/**
 * 回答に関する操作を提供するサービス
 */
const answerService = {
  /**
   * 問題への回答を記録し、スキルレベルを更新する（選択肢を含む問題対応版）
   * @param questionId 問題ID
   * @param userId ユーザーID
   * @param selectedOptionIndex 選択された選択肢のインデックス
   * @param timeTaken 回答までの時間（秒）
   * @returns 更新された問題と能力値
   */
  recordMultipleChoiceAnswer: async (
    questionId: number,
    userId: number,
    selectedOptionIndex: number,
    timeTaken: number
  ) => {
    // トランザクション開始
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 問題を取得
      const question = await recentQuestionRepository.findOne({
        where: { historyId: questionId, user_id: userId },
        relations: ['skill']
      });
      
      if (!question) {
        throw new Error('問題が見つかりません');
      }
      
      // 既に回答済みの場合
      if (question.answeredAt) {
        throw new Error('この問題には既に回答済みです');
      }
      
      // 選択肢の有無を確認
      if (question.correctOptionIndex === undefined || !question.options) {
        throw new Error('この問題は選択式ではありません');
      }
      
      // 選択肢が有効な範囲かチェック
      const parsedOptions = JSON.parse(question.options);
      if (selectedOptionIndex < 0 || selectedOptionIndex >= parsedOptions.length) {
        throw new Error('無効な選択肢が選択されました');
      }
      
      // 正誤を判定
      const isCorrect = selectedOptionIndex === question.correctOptionIndex;
      
      // 問題の回答情報を更新
      question.userAnswerIndex = selectedOptionIndex;
      question.isCorrect = isCorrect;
      question.answeredAt = new Date();
      question.answeredAtTz = new Date();
      question.timeTaken = timeTaken;
      
      await queryRunner.manager.save(question);
      
      // スキルが関連付けられている場合、ユーザーのスキルレベルを更新
      if (question.skillId) {
        // ユーザーのスキルレベルを取得または作成
        let userSkillLevel = await userSkillLevelRepository.findOne({
          where: {
            user_id: userId,
            skill_id: question.skillId
          }
        });
        
        if (!userSkillLevel) {
          // ユーザーのスキルレベルが存在しない場合は新規作成
          userSkillLevel = userSkillLevelRepository.create({
            user_id: userId,
            skill_id: question.skillId,
            skillLevel: 0.0, // 初期能力値
            confidence: 1.0,
            totalAttempts: 0,
            correctAttempts: 0
          });
        }
        
        // 正答率に基づいて学習率を調整
        const correctAnswerRatio = userSkillLevel.totalAttempts > 0 
          ? userSkillLevel.correctAttempts / userSkillLevel.totalAttempts 
          : 0.5;
        
        // IRTパラメータ
        const irtParams = {
          learningRate: irtService.getAdaptiveLearningRate(0.1, correctAnswerRatio),
          discriminationParam: 1.0 + (userSkillLevel.confidence - 1.0) * 0.2 // 信頼度に応じて識別力を調整
        };
        
        // IRTモデルを使用して能力値を更新（パラメータ付き）
        const updatedTheta = irtService.updateTheta(
          userSkillLevel.skillLevel,
          question.difficulty,
          isCorrect,
          irtParams
        );
        
        // 試行回数と正解数を更新
        userSkillLevel.totalAttempts += 1;
        if (isCorrect) {
          userSkillLevel.correctAttempts += 1;
        }
        
        // 信頼度を更新（試行回数に応じて上限あり）
        userSkillLevel.confidence = Math.min(3.0, 1.0 + (userSkillLevel.totalAttempts / 10));
        
        // 能力値を更新
        userSkillLevel.skillLevel = updatedTheta;
        userSkillLevel.lastAttemptAt = new Date();
        
        await queryRunner.manager.save(userSkillLevel);
        
        // トランザクションをコミット
        await queryRunner.commitTransaction();
        
        return {
          question: {
            id: question.historyId,
            text: question.questionText,
            options: parsedOptions,
            selected_option_index: selectedOptionIndex,
            correct_option_index: question.correctOptionIndex,
            explanation: question.explanation,
            isCorrect: question.isCorrect,
            askedAt: question.askedAt,
            answeredAt: question.answeredAt,
            timeTaken: question.timeTaken
          },
          skillLevel: {
            skillId: userSkillLevel.skill_id,
            skillName: question.skill ? question.skill.skillName : 'Unknown',
            level: userSkillLevel.skillLevel,
            confidence: userSkillLevel.confidence,
            totalAttempts: userSkillLevel.totalAttempts,
            correctAttempts: userSkillLevel.correctAttempts
          }
        };
      } else {
        // スキルが関連付けられていない場合はトランザクションをコミット
        await queryRunner.commitTransaction();
        
        return {
          question: {
            id: question.historyId,
            text: question.questionText,
            options: parsedOptions,
            selected_option_index: selectedOptionIndex,
            correct_option_index: question.correctOptionIndex,
            explanation: question.explanation,
            isCorrect: isCorrect,
            askedAt: question.askedAt,
            answeredAt: question.answeredAt,
            timeTaken: question.timeTaken
          },
          skillLevel: null
        };
      }
    } catch (error) {
      // エラーが発生した場合はロールバック
      await queryRunner.rollbackTransaction();
      answerServiceLogger.error(`選択式問題回答記録中にエラーが発生しました: ${error}`);
      throw error;
    } finally {
      // クエリランナーをリリース
      await queryRunner.release();
    }
  },

  /**
   * 問題への回答を記録し、スキルレベルを更新する（従来の自由回答式）
   * @param questionId 問題ID
   * @param userId ユーザーID
   * @param answerText 回答テキスト
   * @param isCorrect 正解かどうか
   * @param timeTaken 回答までの時間（秒）
   * @returns 更新された問題と能力値
   */
  recordAnswer: async (questionId: number, userId: number, answerText: string, isCorrect: boolean, timeTaken: number) => {
    // トランザクション開始
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 問題を取得
      const question = await recentQuestionRepository.findOne({
        where: { historyId: questionId, user_id: userId },
        relations: ['skill']
      });
      
      if (!question) {
        throw new Error('問題が見つかりません');
      }
      
      // 既に回答済みの場合
      if (question.answeredAt) {
        throw new Error('この問題には既に回答済みです');
      }
      
      // 問題の回答情報を更新
      question.answerText = answerText;
      question.isCorrect = isCorrect;
      question.answeredAt = new Date();
      question.answeredAtTz = new Date();
      question.timeTaken = timeTaken;
      
      await queryRunner.manager.save(question);
      
      // スキルが関連付けられている場合、ユーザーのスキルレベルを更新
      if (question.skillId) {
        // ユーザーのスキルレベルを取得または作成
        let userSkillLevel = await userSkillLevelRepository.findOne({
          where: {
            user_id: userId,
            skill_id: question.skillId
          }
        });
        
        if (!userSkillLevel) {
          // ユーザーのスキルレベルが存在しない場合は新規作成
          userSkillLevel = userSkillLevelRepository.create({
            user_id: userId,
            skill_id: question.skillId,
            skillLevel: 0.0, // 初期能力値
            confidence: 1.0,
            totalAttempts: 0,
            correctAttempts: 0
          });
        }
        
        // 正答率に基づいて学習率を調整
        const correctAnswerRatio = userSkillLevel.totalAttempts > 0 
          ? userSkillLevel.correctAttempts / userSkillLevel.totalAttempts 
          : 0.5;
        
        // IRTパラメータ
        const irtParams = {
          learningRate: irtService.getAdaptiveLearningRate(0.1, correctAnswerRatio),
          discriminationParam: 1.0 + (userSkillLevel.confidence - 1.0) * 0.2 // 信頼度に応じて識別力を調整
        };
        
        // IRTモデルを使用して能力値を更新
        const updatedTheta = irtService.updateTheta(
          userSkillLevel.skillLevel,
          question.difficulty,
          isCorrect,
          irtParams
        );
        
        // 試行回数と正解数を更新
        userSkillLevel.totalAttempts += 1;
        if (isCorrect) {
          userSkillLevel.correctAttempts += 1;
        }
        
        // 信頼度を更新（単純な例: 試行回数に応じて信頼度が上がる）
        userSkillLevel.confidence = Math.min(3.0, 1.0 + (userSkillLevel.totalAttempts / 10));
        
        // 能力値を更新
        userSkillLevel.skillLevel = updatedTheta;
        userSkillLevel.lastAttemptAt = new Date();
        
        await queryRunner.manager.save(userSkillLevel);
        
        // トランザクションをコミット
        await queryRunner.commitTransaction();
        
        return {
          question: {
            id: question.historyId,
            text: question.questionText,
            answer: question.answerText,
            isCorrect: question.isCorrect,
            askedAt: question.askedAt,
            answeredAt: question.answeredAt,
            timeTaken: question.timeTaken
          },
          skillLevel: {
            skillId: userSkillLevel.skill_id,
            skillName: question.skill ? question.skill.skillName : 'Unknown',
            level: userSkillLevel.skillLevel,
            confidence: userSkillLevel.confidence,
            totalAttempts: userSkillLevel.totalAttempts,
            correctAttempts: userSkillLevel.correctAttempts
          }
        };
      } else {
        // スキルが関連付けられていない場合はトランザクションをコミット
        await queryRunner.commitTransaction();
        
        return {
          question: {
            id: question.historyId,
            text: question.questionText,
            answer: question.answerText,
            isCorrect: question.isCorrect,
            askedAt: question.askedAt,
            answeredAt: question.answeredAt,
            timeTaken: question.timeTaken
          },
          skillLevel: null
        };
      }
    } catch (error) {
      // エラーが発生した場合はロールバック
      await queryRunner.rollbackTransaction();
      answerServiceLogger.error(`回答記録中にエラーが発生しました: ${error}`);
      throw error;
    } finally {
      // クエリランナーをリリース
      await queryRunner.release();
    }
  }
};

module.exports = answerService;
