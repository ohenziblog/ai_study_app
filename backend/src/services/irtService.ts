// 変数名を一意にして衝突を避ける
const irtLogger = require('../utils/logger').default;

// IRTの設定パラメータ型定義
interface IRTParams {
  learningRate?: number;    // 学習率（能力値の更新速度）
  discriminationParam?: number;  // 識別力パラメータ
  maxTheta?: number;        // 能力値の最大値
  minTheta?: number;        // 能力値の最小値
  maxDifficulty?: number;   // 難易度の最大値
  minDifficulty?: number;   // 難易度の最小値
}

// デフォルト設定値
const DEFAULT_IRT_PARAMS: Required<IRTParams> = {
  learningRate: 0.1,        // デフォルト学習率
  discriminationParam: 1.0, // デフォルト識別力パラメータ
  maxTheta: 3.0,            // 能力値の最大値
  minTheta: -3.0,           // 能力値の最小値
  maxDifficulty: 4.5,       // 難易度の最大値
  minDifficulty: 0.5,       // 難易度の最小値
};

/**
 * IRT（項目応答理論）に関する計算を提供するサービス
 */
const irtServiceImpl = {
  /**
   * 正答確率を計算する
   * @param theta ユーザーの能力パラメータ
   * @param difficulty 問題の難易度パラメータ
   * @param params IRT設定パラメータ（オプション）
   * @returns 正答確率（0-1の値）
   */
  calculateProbability: (theta: number, difficulty: number, params?: IRTParams): number => {
    // デフォルト値とマージ
    const { discriminationParam } = { ...DEFAULT_IRT_PARAMS, ...params };
    
    // 2パラメータロジスティックモデル
    // P(θ) = 1 / (1 + e^(-a(θ-b)))
    // θ: 受験者の能力パラメータ
    // b: 項目難易度パラメータ
    // a: 識別力パラメータ
    return 1 / (1 + Math.exp(-discriminationParam * (theta - difficulty)));
  },
  
  /**
   * ユーザーの能力パラメータを更新する
   * @param currentTheta 現在のユーザー能力値
   * @param difficulty 問題の難易度
   * @param isCorrect 回答が正しいかどうか
   * @param params IRT設定パラメータ（オプション）
   * @returns 更新された能力パラメータ
   */
  updateTheta: (currentTheta: number, difficulty: number, isCorrect: boolean, params?: IRTParams): number => {
    // デフォルト値とマージ
    const { learningRate, discriminationParam, maxTheta, minTheta } = {
      ...DEFAULT_IRT_PARAMS,
      ...params
    };
    
    // 予測確率と実際の結果の差に基づく更新
    const probability = irtServiceImpl.calculateProbability(
      currentTheta,
      difficulty,
      { discriminationParam }
    );
    const actual = isCorrect ? 1 : 0;
    const error = actual - probability;
    
    // 信頼度に基づく重み付け（正答率が0.5に近いほど情報量が大きい）
    // 情報量は p(1-p) で最大となる（p=0.5のとき）
    const informationWeight = probability * (1 - probability);
    
    // より効果的な更新式: θ_new = θ_old + α * (y - P(θ)) * 情報量の重み
    // これにより、予測が不確かな問題（P(θ)が0.5に近い）からより多く学習する
    const updatedTheta = currentTheta + learningRate * error * (1 + informationWeight);
    
    // 能力値を適切な範囲内に制限
    return Math.max(minTheta, Math.min(maxTheta, updatedTheta));
  },
  
  /**
   * 問題の難易度を更新する
   * @param currentDifficulty 現在の難易度
   * @param responses 回答の配列 {isCorrect: boolean, theta: number}[]
   * @param params IRT設定パラメータ（オプション）
   * @returns 更新された難易度
   */
  updateDifficulty: (
    currentDifficulty: number,
    responses: Array<{isCorrect: boolean; theta: number}>,
    params?: IRTParams
  ): number => {
    if (responses.length === 0) return currentDifficulty;
    
    // デフォルト値とマージ
    const { learningRate, discriminationParam, maxDifficulty, minDifficulty } = {
      ...DEFAULT_IRT_PARAMS,
      // 難易度の更新は通常能力値の更新より小さな学習率を使用
      learningRate: (params?.learningRate || DEFAULT_IRT_PARAMS.learningRate) * 0.5,
      ...params
    };
    
    // 各回答から累積誤差と情報量を計算
    let cumulativeError = 0;
    let totalInformation = 0;
    
    responses.forEach(response => {
      const probability = irtServiceImpl.calculateProbability(
        response.theta,
        currentDifficulty,
        { discriminationParam }
      );
      const actual = response.isCorrect ? 1 : 0;
      const error = actual - probability;
      
      // 情報量による重み付け
      const informationWeight = probability * (1 - probability);
      totalInformation += informationWeight;
      
      cumulativeError += error * informationWeight;
    });
    
    // 平均誤差を情報量で正規化
    const averageError = totalInformation > 0 
      ? cumulativeError / totalInformation
      : cumulativeError / responses.length;
    
    // 難易度の更新: b_new = b_old - α(error)
    // 正答率が高いほど難易度は下がり、正答率が低いほど難易度は上がる
    const updatedDifficulty = currentDifficulty - learningRate * averageError;
    
    // 難易度の範囲をminDifficultyからmaxDifficultyに制限
    return Math.max(minDifficulty, Math.min(maxDifficulty, updatedDifficulty));
  },
  
  /**
   * ユーザーに最適な難易度を推定する
   * @param userTheta ユーザーの能力値
   * @param targetProbability 目標正答確率（デフォルト0.7）
   * @param params IRT設定パラメータ（オプション）
   * @returns 推定された最適難易度
   */
  estimateOptimalDifficulty: (
    userTheta: number,
    targetProbability: number = 0.7,
    params?: IRTParams
  ): number => {
    // デフォルト値とマージ
    const { discriminationParam, maxDifficulty, minDifficulty } = { 
      ...DEFAULT_IRT_PARAMS,
      ...params
    };
    
    // 目標正答確率から最適な難易度を計算
    // P(θ) = 1 / (1 + e^(-a(θ-b))) を変形して
    // b = θ + (1/a) * ln((1-P)/P)
    const optimalDifficulty = userTheta + (1 / discriminationParam) * Math.log((1 - targetProbability) / targetProbability);
    
    // 難易度の範囲を制限
    return Math.max(minDifficulty, Math.min(maxDifficulty, optimalDifficulty));
  },

  /**
   * 学習率調整のためのユーティリティ
   * @param baseRate 基本学習率
   * @param correctAnswerRatio 正答率
   * @returns 調整された学習率
   */
  getAdaptiveLearningRate: (baseRate: number, correctAnswerRatio: number): number => {
    // 正答率が極端（0%や100%に近い）場合は学習率を上げる
    // 正答率が50%に近い場合は学習率を下げる（安定化）
    const distanceFrom50Percent = Math.abs(correctAnswerRatio - 0.5);
    
    // 0.5からの距離が大きいほど学習率を上げる（最大2倍）
    const adaptiveFactor = 1 + distanceFrom50Percent * 2;
    
    return baseRate * adaptiveFactor;
  }
};

// モジュール化して内部参照の衝突も回避
module.exports = irtServiceImpl;
