// jwt.ts - JWTユーティリティモジュール
const jwt = require('jsonwebtoken');
const loggerUtil = require('./logger').default;  // 変数名を変更

/**
 * JWTユーティリティ関数群
 */
const jwtUtils = {
  /**
   * JWTトークンを生成する関数
   * @param payload トークンに含めたい情報（userId, roleなど）
   * @returns JWTトークン（署名付きの文字列）
   */
  generateToken: (payload: Record<string, any>): string => {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

      if (!secretKey) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables.');
      }

      return jwt.sign(payload, secretKey, { expiresIn });
    } catch (error) {
      loggerUtil.error(`❌ JWTトークンの生成に失敗しました`);
      loggerUtil.error(error);
      throw error;
    }
  },

  /**
   * JWTトークンを検証して中身を取り出す関数
   * @param token クライアントから送られてきたトークン
   * @returns デコードされたトークン情報（無効な場合はnull）
   */
  verifyToken: (token: string): Record<string, any> | null => {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;

      if (!secretKey) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables.');
      }

      return jwt.verify(token, secretKey) as Record<string, any>;
    } catch (error) {
      loggerUtil.error(`❌ JWTトークンの検証に失敗しました`);
      
      // 本番環境ではエラー詳細を隠す（セキュリティ対策）
      if (process.env.NODE_ENV !== 'production') {
        loggerUtil.error(error);
      }

      return null;
    }
  }
};

module.exports = jwtUtils;
