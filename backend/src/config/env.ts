/**
 * 環境変数の初期化を一箇所で管理するモジュール
 * アプリケーション内の複数のファイルから参照される
 */
const dotenv = require('dotenv');
const path = require('path');

// 環境変数を読み込み（.envファイルの場所を指定）
const result = dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

// .envファイルが読み込めなかった場合はエラーメッセージを表示
if (result.error) {
  console.warn('⚠️ .envファイルが見つからないか、読み込めませんでした');
  console.warn('デフォルト設定またはシステム環境変数を使用します');
} else {
  console.log('✅ 環境変数を読み込みました');
}

// アプリケーション全体で使用する共通の環境変数を定義
const config = {
  // サーバー設定
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // データベース設定
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USERNAME: process.env.DB_USERNAME || 'app_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'secure_password',
  DB_DATABASE: process.env.DB_DATABASE || 'ai_learning_app',
  
  // JWT設定
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_for_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI API設定
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_API_ENDPOINT: process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions',
  
  // その他の設定
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// 開発環境の場合は警告を表示
if (config.NODE_ENV === 'development' && config.JWT_SECRET === 'default_jwt_secret_for_development_only') {
  console.warn('⚠️ デフォルトのJWT_SECRETを使用しています。本番環境では必ず変更してください。');
}

// 設定をエクスポート
module.exports = config;
