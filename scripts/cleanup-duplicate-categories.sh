#!/bin/bash
set -e

echo "重複カテゴリーをマージします..."
psql -U app_user -d ai_learning_app << 'EOF'

-- トランザクション開始
BEGIN;

-- 各CTEステートメントを独立したSQLクエリにする
-- 1. 問題履歴の参照を更新
WITH BestCategories AS (
  SELECT category_name, 
         (ARRAY_AGG(category_id ORDER BY LENGTH(description) DESC))[1] AS best_id
  FROM categories
  GROUP BY category_name
  HAVING COUNT(*) > 1
)
UPDATE question_history qh
SET category_id = bc.best_id
FROM categories c, BestCategories bc
WHERE qh.category_id = c.category_id
  AND c.category_name = bc.category_name
  AND c.category_id != bc.best_id;

-- 2. スキルの参照を更新
WITH BestCategories AS (
  SELECT category_name, 
         (ARRAY_AGG(category_id ORDER BY LENGTH(description) DESC))[1] AS best_id
  FROM categories
  GROUP BY category_name
  HAVING COUNT(*) > 1
)
UPDATE skills s
SET category_id = bc.best_id
FROM categories c, BestCategories bc
WHERE s.category_id = c.category_id
  AND c.category_name = bc.category_name
  AND c.category_id != bc.best_id;

-- 3. 重複カテゴリーを削除
WITH BestCategories AS (
  SELECT category_name, 
         (ARRAY_AGG(category_id ORDER BY LENGTH(description) DESC))[1] AS best_id
  FROM categories
  GROUP BY category_name
  HAVING COUNT(*) > 1
)
DELETE FROM categories c
WHERE EXISTS (
  SELECT 1 FROM categories c2, BestCategories bc
  WHERE c.category_name = c2.category_name
    AND c.category_name = bc.category_name
    AND c.category_id != bc.best_id
);

-- トランザクション終了
COMMIT;
EOF

echo "✅ カテゴリーのマージが完了しました！"

# 結果確認
echo "重複がないことを確認しています..."
psql -U app_user -d ai_learning_app -c "SELECT category_name, COUNT(*) FROM categories GROUP BY category_name HAVING COUNT(*) > 1;"

echo "カテゴリー一覧を表示しています..."
psql -U app_user -d ai_learning_app -c "SELECT category_id, category_name, description FROM categories ORDER BY category_name;"
