import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique, RelationId } from 'typeorm';
import { User } from './User';
import { Skill } from './Skill';

@Entity('user_skill_levels')
@Unique(['user', 'skill'])  // リレーションプロパティを参照
export class UserSkillLevel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.skillLevels)
  @JoinColumn({ name: 'user_id' })
  user!: User;
  
  @RelationId((usl: UserSkillLevel) => usl.user)
  userId!: number;

  @ManyToOne(() => Skill, skill => skill.userSkillLevels)
  @JoinColumn({ name: 'skill_id' })
  skill!: Skill;
  
  @RelationId((usl: UserSkillLevel) => usl.skill)
  skillId!: number;

  @Column({ type: 'float', default: 0.0 })
  skillLevel!: number;

  @Column({ type: 'float', default: 1.0 })
  confidence!: number;

  @Column({ default: 0 })
  totalAttempts!: number;

  @Column({ default: 0 })
  correctAttempts!: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAttemptAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
