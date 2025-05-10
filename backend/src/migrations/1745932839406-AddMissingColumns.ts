import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumns1745932839406 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // テーブルの存在を確認
        const tableExists = await queryRunner.hasTable("question_history");
        if (!tableExists) {
            console.log("テーブルquestion_historyが存在しません。マイグレーションを続行できません。");
            return;
        }

        // 不足しているカラムを追加
        await queryRunner.query(`
            -- 不足していたカラムの追加
            ALTER TABLE question_history 
            ADD COLUMN IF NOT EXISTS question_summary VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS abstract_hash VARCHAR(255) NULL;
            
            -- カラムに関連するインデックスを追加
            CREATE INDEX IF NOT EXISTS idx_question_history_abstract_hash 
            ON question_history (abstract_hash);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // マイグレーションを戻す場合は追加したカラムを削除
        await queryRunner.query(`
            -- インデックスを削除
            DROP INDEX IF EXISTS idx_question_history_abstract_hash;
            
            -- カラムを削除
            ALTER TABLE question_history 
            DROP COLUMN IF EXISTS question_summary,
            DROP COLUMN IF EXISTS abstract_hash;
        `);
    }

}
