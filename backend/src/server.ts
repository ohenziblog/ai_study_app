// src/server.ts
// 環境変数の初期化を共通モジュールから行う
require('./config/env');
require('reflect-metadata');

const loggerService = require('./utils/logger').default;
const { AppDataSource } = require('./config/DataSource');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 現在の環境を表示
loggerService.info(`🌍 実行環境: ${NODE_ENV}`);

// データベース接続 → 成功時にサーバー起動
AppDataSource.initialize()
  .then(() => {
    loggerService.info('✅ データベース接続に成功しました！');
    
    // マイグレーション状態を確認
    AppDataSource.query('SELECT COUNT(*) as count FROM migrations')
      .then((result: any) => {
        const migrationCount = parseInt(result[0]?.count || '0');
        loggerService.info(`🔄 適用済みマイグレーション数: ${migrationCount}`);
      })
      .catch(() => {
        loggerService.warn('⚠️ マイグレーションテーブルにアクセスできません');
      });

    app.listen(PORT, () => {
      loggerService.info(`🚀 サーバー起動中: http://localhost:${PORT}`);
      loggerService.info(`📚 利用可能なエンドポイント:`);
      loggerService.info(`   - GET  /categories     - 全教科の取得`);
      loggerService.info(`   - GET  /categories/:id - 特定教科の取得`);
      loggerService.info(`   - GET  /skills         - 全スキルの取得`);
      loggerService.info(`   - GET  /questions      - 問題の取得（認証必要）`);
    });
  })
  .catch((error: Error) => {
    loggerService.error('❌ データベース接続に失敗しました');
    loggerService.error(error);
  });

module.exports = app;
