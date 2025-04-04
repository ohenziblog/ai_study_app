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
   * 問題への回答を記録し、スキルレベルを更新する
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
      question.answer_text = answerText;
      question.is_correct = isCorrect;
      question.answeredAt = new Date();
      question.timeTaken = timeTaken;
      
      await queryRunner.manager.save(question);
      
      // スキルが関連付けられている場合、ユーザーのスキルレベルを更新
      if (question.skill_id) {
        // ユーザーのスキルレベルを取得または作成
        let userSkillLevel = await userSkillLevelRepository.findOne({
          where: {
            user_id: userId,
            skill_id: question.skill_id
          }
        });
        
        if (!userSkillLevel) {
          // ユーザーのスキルレベルが存在しない場合は新規作成
          userSkillLevel = userSkillLevelRepository.create({
            user_id: userId,
            skill_id: question.skill_id,
            skillLevel: 0.0, // 初期能力値
            confidence: 1.0,
            totalAttempts: 0,
            correctAttempts: 0
          });
        }
        
        // IRTモデルを使用して能力値を更新
        const updatedTheta = irtService.updateTheta(
          userSkillLevel.skillLevel,
          question.difficulty,
          isCorrect
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
            text: question.question_text,
            answer: question.answer_text,
            isCorrect: question.is_correct,
            askedAt: question.askedAt,
            answeredAt: question.answeredAt,
            timeTaken: question.timeTaken
          },
          skillLevel: {
            skillId: userSkillLevel.skill_id,
            skillName: question.skill ? question.skill.skill_name : 'Unknown',
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
            text: question.question_text,
            answer: question.answer_text,
            isCorrect: question.is_correct,
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
      answerServiceLogger.error(`回答記録中にエラーが発生しました: ${error}`); // ここも変数名を変更
      throw error;
    } finally {
      // クエリランナーをリリース
      await queryRunner.release();
    }
  }
};

module.exports = answerService;
