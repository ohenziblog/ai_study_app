import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntityModels1747356789012 implements MigrationInterface {
    name = 'UpdateEntityModels1747356789012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // スキルテーブルの必須フィールド設定
        await queryRunner.query(`ALTER TABLE "skills" ALTER COLUMN "difficulty_base" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "skills" ALTER COLUMN "difficulty_base" SET DEFAULT '0'`);
        
        // ユーザースキルレベルテーブルの必須フィールド設定
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "skill_level" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "skill_level" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "confidence" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "confidence" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "total_attempts" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "correct_attempts" SET NOT NULL`);
        
        // ユーザーテーブルの必須フィールド設定
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "settings" SET NOT NULL`);
        
        // カテゴリーテーブルの必須フィールド設定
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "level" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // カテゴリーテーブルのロールバック
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "level" DROP NOT NULL`);
        
        // ユーザーテーブルのロールバック
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "settings" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" DROP NOT NULL`);
        
        // ユーザースキルレベルテーブルのロールバック
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "correct_attempts" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "total_attempts" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "confidence" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "confidence" SET DEFAULT 1.0`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "skill_level" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_skill_levels" ALTER COLUMN "skill_level" SET DEFAULT 0.0`);
        
        // スキルテーブルのロールバック
        await queryRunner.query(`ALTER TABLE "skills" ALTER COLUMN "difficulty_base" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "skills" ALTER COLUMN "difficulty_base" SET DEFAULT 0.0`);
    }
}
