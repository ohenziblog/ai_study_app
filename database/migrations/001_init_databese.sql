-- AI活用型個別最適化学習アプリ - データベース初期化スクリプト

-- データベース作成
CREATE DATABASE ai_learning_app;

-- ユーザー作成と権限付与
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_learning_app TO app_user;

\c ai_learning_app;

-- 拡張機能
CREATE EXTENSION IF NOT EXISTS ltree;

-- テーブル作成
-- 1. ユーザーテーブル (users)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'student',
    settings JSONB DEFAULT '{}'::jsonb
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_settings ON users USING GIN (settings);

-- 2. カテゴリーテーブル (categories)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0,
    path LTREE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR
);

-- インデックス
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories USING GIST (path);
CREATE INDEX idx_categories_name ON categories(category_name);
CREATE INDEX idx_categories_search ON categories USING GIN (search_vector);

-- 3. スキルテーブル (skills)
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    difficulty_base FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(skill_name, category_id)
);

-- インデックス
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_skills_name ON skills(skill_name);

-- 4. ユーザースキルレベルテーブル (user_skill_levels)
CREATE TABLE user_skill_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    skill_level FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 1.0,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- インデックス
CREATE INDEX idx_user_skill_levels_user_id ON user_skill_levels(user_id);
CREATE INDEX idx_user_skill_levels_skill_id ON user_skill_levels(skill_id);
CREATE INDEX idx_user_skill_levels_level ON user_skill_levels(skill_level);

-- 5. 出題履歴テーブル (question_history)
CREATE TABLE question_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question_hash VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    difficulty FLOAT,
    category_id INTEGER REFERENCES categories(category_id),
    skill_id INTEGER REFERENCES skills(skill_id),
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    time_taken INTEGER -- 回答にかかった時間（秒）
);

-- インデックス
CREATE INDEX idx_question_history_user_id ON question_history(user_id);
CREATE INDEX idx_question_history_hash ON question_history(question_hash);
CREATE INDEX idx_question_history_asked_at ON question_history(asked_at);
CREATE INDEX idx_question_history_skill_id ON question_history(skill_id);
CREATE INDEX idx_question_history_user_hash ON question_history(user_id, question_hash);

-- 6. カテゴリー・スキルの関連テーブル (category_skill_map)
CREATE TABLE category_skill_map (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    relevance FLOAT DEFAULT 1.0, -- スキルとカテゴリの関連度（0.0~1.0）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, skill_id)
);

-- インデックス
CREATE INDEX idx_category_skill_map_category ON category_skill_map(category_id);
CREATE INDEX idx_category_skill_map_skill ON category_skill_map(skill_id);

-- トリガー関数: カテゴリーの検索ベクトル更新
CREATE OR REPLACE FUNCTION categories_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = 
        setweight(to_tsvector('english', COALESCE(NEW.category_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 検索ベクトル更新トリガーの作成
CREATE TRIGGER categories_search_vector_update_trigger
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION categories_search_vector_update();

-- パスを管理するためのトリガー関数
CREATE OR REPLACE FUNCTION update_category_path() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = text2ltree(NEW.category_id::text);
        NEW.level = 0;
    ELSE
        SELECT path, level INTO NEW.path, NEW.level FROM categories WHERE category_id = NEW.parent_id;
        NEW.path = NEW.path || text2ltree(NEW.category_id::text);
        NEW.level = NEW.level + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- カテゴリーパストリガーの作成
CREATE TRIGGER update_category_path_trigger
BEFORE INSERT OR UPDATE OF parent_id ON categories
FOR EACH ROW EXECUTE FUNCTION update_category_path();

-- 初期データ: 基本カテゴリーの作成
INSERT INTO categories (category_name, description, parent_id) 
VALUES ('数学', '数学に関連するカテゴリー', NULL);

INSERT INTO categories (category_name, description, parent_id) 
VALUES ('国語', '国語に関連するカテゴリー', NULL);

INSERT INTO categories (category_name, description, parent_id) 
VALUES ('理科', '理科に関連するカテゴリー', NULL);

INSERT INTO categories (category_name, description, parent_id) 
VALUES ('社会', '社会に関連するカテゴリー', NULL);

INSERT INTO categories (category_name, description, parent_id) 
VALUES ('英語', '英語に関連するカテゴリー', NULL);