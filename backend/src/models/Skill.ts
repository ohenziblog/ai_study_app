import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Category } from './Category';
import { UserSkillLevel } from './UserSkillLevel';
import { RecentQuestion } from './RecentQuestion';

@Entity('skills')
@Unique(['skill_name', 'category_id'])
export class Skill {
  @PrimaryGeneratedColumn()
  skill_id!: number;

  @Column({ length: 100 })
  skill_name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  category_id!: number;

  @ManyToOne(() => Category, category => category.skills)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ name: 'difficulty_base', type: 'float', default: 0.0 })
  difficultyBase!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => UserSkillLevel, userSkillLevel => userSkillLevel.skill)
  userSkillLevels!: UserSkillLevel[];

  @OneToMany(() => RecentQuestion, recentQuestion => recentQuestion.skill)
  recentQuestions!: RecentQuestion[];
}
