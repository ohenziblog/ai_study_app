import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultipleChoiceSupport1743456789012 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // question_historyテーブルに問題要約と抽象化ハッシュのカラムを追加
        await queryRunner.query(`
            ALTER TABLE question_history 
            ADD COLUMN IF NOT EXISTS question_summary VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS abstract_hash VARCHAR(255) NULL;
        `);
        
        // インデックスを追加して検索パフォーマンスを向上
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_abstract_hash ON question_history (abstract_hash);
            CREATE INDEX IF NOT EXISTS idx_question_history_user_id_asked_at ON question_history (user_id, askedAt DESC);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // インデックスを削除
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_abstract_hash;
            DROP INDEX IF EXISTS idx_question_history_user_id_asked_at;
        `);
        
        // カラムを削除
        await queryRunner.query(`
            ALTER TABLE question_history 
            DROP COLUMN IF EXISTS question_summary,
            DROP COLUMN IF EXISTS abstract_hash;
        `);
    }
}