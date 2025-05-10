import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique, RelationId } from 'typeorm';
import { Category } from './Category';
import { UserSkillLevel } from './UserSkillLevel';
import { RecentQuestion } from './RecentQuestion';

@Entity('skills')
@Unique(['skillName', 'category'])
export class Skill {
  @PrimaryGeneratedColumn()
  skillId!: number;

  @Column({ length: 100 })
  skillName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToOne(() => Category, category => category.skills)
  @JoinColumn({ name: 'category_id'})
  category!: Category;

  @RelationId((skill: Skill) => skill.category)
  categoryId!: number;

  @Column({ type: 'float', default: 0.0 })
  difficultyBase!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => UserSkillLevel, userSkillLevel => userSkillLevel.skill)
  userSkillLevels!: UserSkillLevel[];

  @OneToMany(() => RecentQuestion, recentQuestion => recentQuestion.skill)
  recentQuestions!: RecentQuestion[];
}
