-- データベース作成
CREATE DATABASE ai_learning_app;

-- ユーザー作成と権限付与
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_learning_app TO app_user;

\c ai_learning_app;

-- 拡張機能
CREATE EXTENSION IF NOT EXISTS ltree;

-- テーブル作成は上記の各テーブル定義SQLを順に実行
