// 変数名を一意にして衝突を避ける
const irtLogger = require('../utils/logger').default;

/**
 * IRT（項目応答理論）に関する計算を提供するサービス
 */
const irtServiceImpl = {
  /**
   * 正答確率を計算する
   * @param theta ユーザーの能力パラメータ
   * @param difficulty 問題の難易度パラメータ
   * @returns 正答確率（0-1の値）
   */
  calculateProbability: (theta: number, difficulty: number): number => {
    // 3パラメータロジスティックモデルの簡易版（2パラメータモデル）
    // a: 識別力パラメータ（固定値として1.0を使用）
    const a = 1.0;
    
    // 正答確率の計算: P(θ) = 1 / (1 + e^(-a(θ-b)))
    // θ: 受験者の能力パラメータ
    // b: 項目難易度パラメータ
    return 1 / (1 + Math.exp(-a * (theta - difficulty)));
  },
  
  /**
   * ユーザーの能力パラメータを更新する
   * @param currentTheta 現在のユーザー能力値
   * @param difficulty 問題の難易度
   * @param isCorrect 回答が正しいかどうか
   * @returns 更新された能力パラメータ
   */
  updateTheta: (currentTheta: number, difficulty: number, isCorrect: boolean): number => {
    // 学習率（更新の強さを制御）
    const learningRate = 0.1;
    
    // 予測確率と実際の結果の差に基づく更新
    const probability = irtServiceImpl.calculateProbability(currentTheta, difficulty);
    const actual = isCorrect ? 1 : 0;
    const error = actual - probability;
    
    // θの更新: θ_new = θ_old + α(y - P(θ))
    // α: 学習率
    // y: 実際の結果（0または1）
    // P(θ): 予測確率
    const updatedTheta = currentTheta + learningRate * error;
    
    // 能力値の範囲を-3.0から3.0に制限（標準的なIRTの範囲）
    return Math.max(-3.0, Math.min(3.0, updatedTheta));
  },
  
  /**
   * 問題の難易度を更新する
   * @param currentDifficulty 現在の難易度
   * @param responses 回答の配列 {isCorrect: boolean, theta: number}[]
   * @returns 更新された難易度
   */
  updateDifficulty: (currentDifficulty: number, responses: Array<{isCorrect: boolean, theta: number}>): number => {
    if (responses.length === 0) return currentDifficulty;
    
    // 学習率（難易度更新の強さを制御）
    const learningRate = 0.05;
    
    // 各回答から累積誤差を計算
    let cumulativeError = 0;
    
    responses.forEach(response => {
      const probability = irtServiceImpl.calculateProbability(response.theta, currentDifficulty);
      const actual = response.isCorrect ? 1 : 0;
      cumulativeError += (actual - probability);
    });
    
    // 平均誤差
    const averageError = cumulativeError / responses.length;
    
    // 難易度の更新: b_new = b_old - α(error)
    // 正答率が高いほど難易度は下がる方向に、正答率が低いほど難易度は上がる方向に調整
    const updatedDifficulty = currentDifficulty - learningRate * averageError;
    
    // 難易度の範囲を0.5から4.5に制限
    return Math.max(0.5, Math.min(4.5, updatedDifficulty));
  }
};

// モジュール化して内部参照の衝突も回避
module.exports = irtServiceImpl;
