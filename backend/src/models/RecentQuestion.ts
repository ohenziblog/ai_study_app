import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, RelationId } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Skill } from './Skill';

@Entity({ name: 'question_history' })
export class RecentQuestion {
    @PrimaryGeneratedColumn('increment')
    historyId!: number;

    @ManyToOne(() => User, user => user.recentQuestions)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @RelationId((rq: RecentQuestion) => rq.user)
    userId!: number;

    @Column({ length: 255 })
    questionHash!: string;

    @Column({ type: 'text' })
    questionText!: string;

    // 問題の要約（簡潔な説明、類似問題検出に使用）
    @Column({ length: 255, nullable: true })
    questionSummary!: string;

    // 問題の抽象ハッシュ（キーワードやコンセプト、類似問題検出に使用）
    @Column({ length: 255, nullable: true })
    abstractHash!: string;

    @Column({ type: 'float' })
    difficulty!: number;

    // 選択肢（JSONとして保存）
    @Column({ type: 'text', nullable: true })
    options!: string;

    // 正解の選択肢のインデックス
    @Column({ nullable: true })
    correctOptionIndex!: number;

    // 解説
    @Column({ type: 'text', nullable: true })
    explanation!: string;

    // ユーザーの回答（複数選択式の場合はインデックス）
    @Column({ nullable: true, name: 'user_answer_index' })
    userAnswerIndex!: number;

    // 正解かどうか
    @Column({ nullable: true })
    isCorrect!: boolean;

    // 質問が表示された時間
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    askedAt!: Date;

    // 回答された時間（nullの場合は未回答）
    @Column({ type: 'timestamp', nullable: true })
    answeredAt!: Date;

    // タイムゾーン情報を含む回答時間
    @Column({ type: 'timestamp with time zone', nullable: true })
    answeredAtTz!: Date;

    // データベースには存在するが現在使用していない可能性のあるカラムのマッピング
    @Column({ type: 'text', nullable: true })
    answerText!: string;

    @Column({ type: 'integer', nullable: true })
    timeTaken!: number;

    // カテゴリとのリレーション
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category!: Category;

    @RelationId((rq: RecentQuestion) => rq.category)
    categoryId!: number;

    // スキルとのリレーション
    @ManyToOne(() => Skill)
    @JoinColumn({ name: 'skill_id' })
    skill!: Skill;

    @RelationId((rq: RecentQuestion) => rq.skill)
    skillId!: number;
}
