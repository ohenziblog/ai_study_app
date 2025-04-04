import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Skill } from './Skill';

@Entity('user_skill_levels')
@Unique(['user_id', 'skill_id'])
export class UserSkillLevel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, user => user.skillLevels)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  skill_id!: number;

  @ManyToOne(() => Skill, skill => skill.userSkillLevels)
  @JoinColumn({ name: 'skill_id' })
  skill!: Skill;

  @Column({ name: 'skill_level', type: 'float', default: 0.0 })
  skillLevel!: number;

  @Column({ type: 'float', default: 1.0 })
  confidence!: number;

  @Column({ name: 'total_attempts', default: 0 })
  totalAttempts!: number;

  @Column({ name: 'correct_attempts', default: 0 })
  correctAttempts!: number;

  @Column({ name: 'last_attempt_at', type: 'timestamp with time zone', nullable: true })
  lastAttemptAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
