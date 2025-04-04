import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Skill } from './Skill';

@Entity('question_history')
export class RecentQuestion {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  historyId!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, user => user.recentQuestions)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 64 })
  question_hash!: string;

  @Column({ type: 'text' })
  question_text!: string;

  @Column({ type: 'text', nullable: true })
  answer_text!: string;

  @Column({ nullable: true })
  is_correct!: boolean;

  @Column({ type: 'float', nullable: true })
  difficulty!: number;

  @Column({ nullable: true })
  category_id!: number;

  @ManyToOne(() => Category, category => category.recentQuestions)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ nullable: true })
  skill_id!: number;

  @ManyToOne(() => Skill, skill => skill.recentQuestions)
  @JoinColumn({ name: 'skill_id' })
  skill!: Skill;

  @CreateDateColumn({ name: 'asked_at' })
  askedAt!: Date;

  @Column({ name: 'answered_at', type: 'timestamp with time zone', nullable: true })
  answeredAt!: Date;

  @Column({ name: 'time_taken', nullable: true })
  timeTaken!: number;
}
