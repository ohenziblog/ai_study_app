#!/bin/bash
set -e

# PostgreSQLサーバーが起動していることを確認
pg_isready -h localhost -p 5432 -U postgres || {
  echo "PostgreSQLサーバーが起動していません。先にPostgreSQLを起動してください。"
  exit 1
}

# データベースとユーザーの作成
echo "データベースとユーザーを作成しています..."
psql -U postgres -c "CREATE DATABASE ai_learning_app WITH ENCODING 'UTF8';" || echo "データベースは既に存在します"
psql -U postgres -c "CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';" || echo "ユーザーは既に存在します"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_learning_app TO app_user;"
psql -U postgres -c "ALTER USER app_user CREATEDB;" # テスト用にデータベース作成権限を付与

# マイグレーションとシードデータの実行
echo "マイグレーションを実行しています..."
cd ../backend
pnpm run migration:run

echo "初期データを投入しています..."
pnpm run db:seed

echo "✅ データベースのセットアップが完了しました！"
