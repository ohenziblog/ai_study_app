import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeColumnsAndAddTimezoneSupport1747000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // テーブルの存在を確認
        const tableExists = await queryRunner.hasTable("question_history");
        if (!tableExists) {
            console.log("テーブルquestion_historyが存在しません。マイグレーションを続行できません。");
            return;
        }

        // 1. カラムの存在確認と命名規則の統一
        await queryRunner.query(`
            DO $$
            DECLARE
                column_exists BOOLEAN;
            BEGIN
                -- 1.1. スネークケースとキャメルケースの重複確認と統一（askedAt/asked_at）
                -- asked_atが存在するか確認
                SELECT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'asked_at'
                    AND NOT attisdropped
                ) INTO column_exists;

                IF column_exists THEN
                    -- askedAtも存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'askedAt'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- 両方存在する場合はデータをマージしてaskedAtを削除
                        UPDATE question_history
                        SET asked_at = "askedAt"
                        WHERE asked_at IS NULL AND "askedAt" IS NOT NULL;
                        
                        ALTER TABLE question_history DROP COLUMN "askedAt";
                    END IF;
                ELSE
                    -- asked_atが存在しない場合
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'askedAt'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- askedAtのみ存在する場合はasked_atにリネーム
                        ALTER TABLE question_history RENAME COLUMN "askedAt" TO asked_at;
                    END IF;
                END IF;

                -- 1.2. スネークケースとキャメルケースの重複確認と統一（answeredAt/answered_at）
                -- answered_atが存在するか確認
                SELECT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'answered_at'
                    AND NOT attisdropped
                ) INTO column_exists;

                IF column_exists THEN
                    -- answeredAtも存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'answeredAt'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- 両方存在する場合はデータをマージしてansweredAtを削除
                        UPDATE question_history
                        SET answered_at = "answeredAt"
                        WHERE answered_at IS NULL AND "answeredAt" IS NOT NULL;
                        
                        ALTER TABLE question_history DROP COLUMN "answeredAt";
                    END IF;
                ELSE
                    -- answered_atが存在しない場合
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'answeredAt'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- answeredAtのみ存在する場合はanswered_atにリネーム
                        ALTER TABLE question_history RENAME COLUMN "answeredAt" TO answered_at;
                    END IF;
                END IF;

                -- 1.3. answeredAtTzとanswered_at_tzの整理
                -- answered_at_tzが存在するか確認
                SELECT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'answered_at_tz'
                    AND NOT attisdropped
                ) INTO column_exists;

                IF column_exists THEN
                    -- answeredAtTzも存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'answeredAtTz'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- 両方存在する場合はデータをマージしてansweredAtTzを削除
                        UPDATE question_history
                        SET answered_at_tz = "answeredAtTz"
                        WHERE answered_at_tz IS NULL AND "answeredAtTz" IS NOT NULL;
                        
                        ALTER TABLE question_history DROP COLUMN "answeredAtTz";
                    END IF;
                ELSE
                    -- answered_at_tzが存在しない場合
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'answeredAtTz'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- answeredAtTzのみ存在する場合はanswered_at_tzにリネーム
                        ALTER TABLE question_history RENAME COLUMN "answeredAtTz" TO answered_at_tz;
                    ELSE
                        -- どちらも存在しない場合はanswered_at_tzを追加
                        ALTER TABLE question_history ADD COLUMN answered_at_tz TIMESTAMP WITH TIME ZONE NULL;
                    END IF;
                END IF;

                -- 1.4. userAnswerIndexとselectedOptionIndexの整理
                -- user_answer_indexが存在するか確認
                SELECT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'user_answer_index'
                    AND NOT attisdropped
                ) INTO column_exists;

                IF NOT column_exists THEN
                    -- user_answer_indexが存在しない場合
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'userAnswerIndex'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- userAnswerIndexのみ存在する場合はuser_answer_indexにリネーム
                        ALTER TABLE question_history RENAME COLUMN "userAnswerIndex" TO user_answer_index;
                    END IF;
                END IF;

                -- selected_option_indexが存在するか確認
                SELECT EXISTS (
                    SELECT 1 FROM pg_attribute 
                    WHERE attrelid = 'question_history'::regclass
                    AND attname = 'selected_option_index'
                    AND NOT attisdropped
                ) INTO column_exists;

                IF column_exists THEN
                    -- user_answer_indexも存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'user_answer_index'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- 両方存在する場合はデータをマージしてselected_option_indexを削除
                        UPDATE question_history
                        SET user_answer_index = selected_option_index
                        WHERE user_answer_index IS NULL AND selected_option_index IS NOT NULL;
                        
                        ALTER TABLE question_history DROP COLUMN selected_option_index;
                    END IF;
                ELSE
                    -- selectedOptionIndexが存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'question_history'::regclass
                        AND attname = 'selectedOptionIndex'
                        AND NOT attisdropped
                    ) INTO column_exists;

                    IF column_exists THEN
                        -- selectedOptionIndexが存在する場合
                        SELECT EXISTS (
                            SELECT 1 FROM pg_attribute 
                            WHERE attrelid = 'question_history'::regclass
                            AND attname = 'user_answer_index'
                            AND NOT attisdropped
                        ) INTO column_exists;

                        IF column_exists THEN
                            -- user_answer_indexも存在する場合はデータをマージしてselectedOptionIndexを削除
                            UPDATE question_history
                            SET user_answer_index = "selectedOptionIndex"
                            WHERE user_answer_index IS NULL AND "selectedOptionIndex" IS NOT NULL;
                            
                            ALTER TABLE question_history DROP COLUMN "selectedOptionIndex";
                        ELSE
                            -- user_answer_indexが存在しない場合はselectedOptionIndexをuser_answer_indexにリネーム
                            ALTER TABLE question_history RENAME COLUMN "selectedOptionIndex" TO user_answer_index;
                        END IF;
                    END IF;
                END IF;

                -- 1.5. インデックス作成
                -- インデックスが存在しない場合のみ作成
                CREATE INDEX IF NOT EXISTS idx_question_history_answered_at_tz 
                ON question_history (answered_at_tz DESC);
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // マイグレーションを元に戻す場合
        await queryRunner.query(`
            -- インデックスを削除
            DROP INDEX IF EXISTS idx_question_history_answered_at_tz;
            
            -- カラムを削除
            ALTER TABLE question_history 
            DROP COLUMN IF EXISTS answered_at_tz;
        `);
        
        // 注意: この復元操作はリネームされたカラムを元に戻すものではありません
        // カラム名の変更を完全に元に戻すには、データベースのバックアップからの復元が必要です
        console.log("このマイグレーションを完全に元に戻すには、データベースの手動復元が必要な場合があります。");
    }
}