import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 教育データ（5教科とスキル）の初期データを挿入するマイグレーション
 * 
 * このマイグレーションは以下を実行します：
 * 1. 5つの基本教科（数学、国語、社会、英語、理科）を作成
 * 2. 各教科に7つの基本スキルを作成（合計35スキル）
 * 
 * 前提条件：
 * - categories テーブルと skills テーブルが既に存在していること
 * - CreateTables マイグレーションが適用済みであること
 */
export class SeedEducationData1743142021796 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // loggerユーティリティをインポート
        const logger = require('../utils/logger').default;
        
        // マイグレーション履歴をチェック - ここを修正（migration → name）
        const appliedMigrations = await queryRunner.query(
            `SELECT name FROM migrations WHERE name LIKE '%CreateTables%'`
        );
        
        if (appliedMigrations.length === 0) {
            logger.warn('⚠️ 警告: CreateTables マイグレーションが適用されていない可能性があります。');
            logger.warn('テーブル構造が存在しない場合、このマイグレーションは失敗します。');
        }

        // 環境別のデータ設定（開発環境には詳細なログを出力）
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        try {
            // カテゴリー（教科）の定義
            const categories = [
                {
                    name: '数学',
                    description: '数と式、図形、関数など、論理的思考力を養う科目',
                    skills: [
                        { name: '数と式', description: '基本的な計算から方程式、不等式まで', difficulty: 2.0 },
                        { name: '図形', description: '平面図形と空間図形、証明問題', difficulty: 2.5 },
                        { name: '関数', description: '一次関数、二次関数、指数・対数関数', difficulty: 3.0 },
                        { name: '確率統計', description: '場合の数、確率、統計的な分析', difficulty: 2.7 },
                        { name: '微分積分', description: '関数の微分と積分', difficulty: 3.5 },
                        { name: '線形代数', description: 'ベクトルと行列', difficulty: 3.2 },
                        { name: '集合と論理', description: '集合、命題、論理', difficulty: 2.3 },
                    ]
                },
                {
                    name: '国語',
                    description: '読解力、表現力、言語感覚を養う科目',
                    skills: [
                        { name: '現代文読解', description: '現代の文章の読解と分析', difficulty: 2.2 },
                        { name: '古文', description: '古典文学の読解と文法', difficulty: 3.0 },
                        { name: '漢文', description: '漢文の読解と句法', difficulty: 3.2 },
                        { name: '文法', description: '日本語の文法と語彙', difficulty: 2.5 },
                        { name: '表現技法', description: '文章表現の技法と修辞', difficulty: 2.8 },
                        { name: '小論文', description: '論理的な文章の構成と表現', difficulty: 3.0 },
                        { name: '文学史', description: '日本と世界の文学の歴史', difficulty: 2.7 },
                    ]
                },
                {
                    name: '社会',
                    description: '歴史、地理、公民を通じて社会の仕組みを学ぶ科目',
                    skills: [
                        { name: '日本史', description: '日本の歴史と文化', difficulty: 2.5 },
                        { name: '世界史', description: '世界の歴史と文明', difficulty: 2.7 },
                        { name: '地理', description: '自然環境と人間活動の関係', difficulty: 2.3 },
                        { name: '現代社会', description: '現代の社会問題と課題', difficulty: 2.0 },
                        { name: '政治経済', description: '政治制度と経済の仕組み', difficulty: 2.8 },
                        { name: '倫理', description: '思想と道徳、人間の生き方', difficulty: 3.0 },
                        { name: '時事問題', description: '最新の社会情勢と国際問題', difficulty: 2.5 },
                    ]
                },
                {
                    name: '英語',
                    description: 'コミュニケーション能力と国際感覚を養う外国語科目',
                    skills: [
                        { name: '英文法', description: '英語の文法と構文', difficulty: 2.3 },
                        { name: '英単語', description: '語彙力の強化', difficulty: 2.0 },
                        { name: 'リーディング', description: '英文の読解と理解', difficulty: 2.5 },
                        { name: 'リスニング', description: '英語の聞き取り能力', difficulty: 2.7 },
                        { name: 'スピーキング', description: '英語での会話と表現', difficulty: 3.0 },
                        { name: 'ライティング', description: '英語での文章作成', difficulty: 3.0 },
                        { name: '英語表現', description: '慣用表現やイディオム', difficulty: 2.8 },
                    ]
                },
                {
                    name: '理科',
                    description: '自然現象のしくみや法則を探究する科目',
                    skills: [
                        { name: '物理', description: '力学、電磁気学、熱力学など', difficulty: 3.2 },
                        { name: '化学', description: '物質の性質と変化、化学反応', difficulty: 3.0 },
                        { name: '生物', description: '生命現象と生物の多様性', difficulty: 2.8 },
                        { name: '地学', description: '地球と宇宙の構造と変化', difficulty: 2.7 },
                        { name: '実験', description: '科学的な実験と観察方法', difficulty: 2.5 },
                        { name: '環境科学', description: '環境問題と持続可能性', difficulty: 2.3 },
                        { name: '科学史', description: '科学の発展と歴史', difficulty: 2.0 },
                    ]
                }
            ];

            // トランザクション開始
            await queryRunner.startTransaction();

            try {
                // シードデータの挿入処理
                for (const category of categories) {
                    if (isDevelopment) {
                        logger.info(`カテゴリー「${category.name}」を挿入します...`);
                    }
                    
                    // 既存のカテゴリーをチェック（重複回避）
                    const existingCategory = await queryRunner.query(
                        `SELECT category_id FROM categories WHERE category_name = $1`,
                        [category.name]
                    );
                    
                    // カテゴリーがまだ存在しない場合のみ挿入
                    let categoryId;
                    if (existingCategory.length === 0) {
                        // カテゴリーを挿入
                        const result = await queryRunner.query(
                            `INSERT INTO categories (category_name, description, level, path)
                            VALUES ($1, $2, 0, '') RETURNING category_id`,
                            [category.name, category.description]
                        );
                        
                        categoryId = result[0].category_id;
                    } else {
                        // 既存のカテゴリーIDを使用
                        categoryId = existingCategory[0].category_id;
                        logger.info(`カテゴリー「${category.name}」は既に存在します。ID: ${categoryId}`);
                    }

                    // カテゴリーに属するスキルを挿入
                    for (const skill of category.skills) {
                        // 既存のスキルをチェック（重複回避）
                        const existingSkill = await queryRunner.query(
                            `SELECT skill_id FROM skills WHERE skill_name = $1 AND category_id = $2`,
                            [skill.name, categoryId]
                        );
                        
                        if (existingSkill.length === 0) {
                            if (isDevelopment) {
                                logger.debug(`  - スキル「${skill.name}」を挿入します（難易度: ${skill.difficulty}）`);
                            }
                            
                            await queryRunner.query(
                                `INSERT INTO skills (skill_name, description, category_id, difficulty_base)
                                VALUES ($1, $2, $3, $4)`,
                                [skill.name, skill.description, categoryId, skill.difficulty]
                            );
                        } else {
                            logger.debug(`  - スキル「${skill.name}」は既に存在します。スキップします。`);
                        }
                    }
                }

                // トランザクションをコミット
                await queryRunner.commitTransaction();
                logger.info('✅ 教育データのシードが正常に完了しました');
            } catch (error) {
                // エラー発生時はロールバック
                await queryRunner.rollbackTransaction();
                logger.error('❌ 教育データのシード中にエラーが発生しました');
                throw error;
            }
        } catch (error) {
            logger.error('マイグレーション実行中にエラーが発生しました:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // loggerユーティリティをインポート
        const logger = require('../utils/logger').default;
        
        // トランザクション開始
        await queryRunner.startTransaction();
        
        try {
            // 初期データの削除（スキル→カテゴリーの順で削除）
            logger.info('教育データを削除しています...');
            await queryRunner.query(`DELETE FROM skills`);
            await queryRunner.query(`DELETE FROM categories`);
            
            // トランザクションをコミット
            await queryRunner.commitTransaction();
            logger.info('✅ 教育データの削除が完了しました');
        } catch (error) {
            // エラー発生時はロールバック
            await queryRunner.rollbackTransaction();
            logger.error('❌ データ削除中にエラーが発生しました');
            throw error;
        }
    }
}
