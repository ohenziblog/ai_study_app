import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestionHistoryTable1745931247876 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // まず既存のテーブル構造を確認
        const tableExists = await queryRunner.hasTable("question_history");
        if (!tableExists) {
            console.log("テーブルquestion_historyが存在しません。マイグレーションを続行できません。");
            return;
        }

        // 必要なカラムが存在するか確認し、ない場合は追加する
        await queryRunner.query(`
            -- 基本テキスト列の追加
            ALTER TABLE question_history 
            ADD COLUMN IF NOT EXISTS question_text TEXT,
            ADD COLUMN IF NOT EXISTS difficulty FLOAT DEFAULT 2.0,
            ADD COLUMN IF NOT EXISTS options TEXT NULL,
            ADD COLUMN IF NOT EXISTS correct_option_index INTEGER NULL,
            ADD COLUMN IF NOT EXISTS explanation TEXT NULL,
            ADD COLUMN IF NOT EXISTS user_answer_index INTEGER NULL,
            ADD COLUMN IF NOT EXISTS is_correct BOOLEAN NULL,
            ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP NULL;
            
            -- askedAtカラムが存在しない場合は追加（PostgreSQL では列名をダブルクォートで囲むと大文字小文字が保持される）
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'askedAt'
                    AND NOT attisdropped
                ) THEN
                    -- asked_atカラムが存在する場合は名前を変更
                    IF EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'asked_at'
                        AND NOT attisdropped
                    ) THEN
                        ALTER TABLE question_history RENAME COLUMN asked_at TO "askedAt";
                    ELSE
                        -- どちらも存在しない場合は新規作成
                        ALTER TABLE question_history ADD COLUMN "askedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                    END IF;
                END IF;
            END $$;
            
            -- 既存のインデックスを再作成（もし存在しなければ）
            CREATE INDEX IF NOT EXISTS idx_question_history_user_id ON question_history (user_id);
            CREATE INDEX IF NOT EXISTS idx_question_history_skill_id ON question_history (skill_id);
            CREATE INDEX IF NOT EXISTS idx_question_history_category_id ON question_history (category_id);
        `);
        
        // askedAtカラムのインデックスを別途作成（カラム名が確定した後で）
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_question_history_asked_at ON question_history ("askedAt" DESC);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // このマイグレーションを元に戻す場合は追加したカラムを削除
        await queryRunner.query(`
            ALTER TABLE question_history 
            DROP COLUMN IF EXISTS question_text,
            DROP COLUMN IF EXISTS difficulty,
            DROP COLUMN IF EXISTS options,
            DROP COLUMN IF EXISTS correct_option_index,
            DROP COLUMN IF EXISTS explanation,
            DROP COLUMN IF EXISTS user_answer_index,
            DROP COLUMN IF EXISTS is_correct,
            DROP COLUMN IF EXISTS "answeredAt";
        `);
    }
}
