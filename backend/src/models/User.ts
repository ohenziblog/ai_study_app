import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserSkillLevel } from './UserSkillLevel';
import { RecentQuestion } from './RecentQuestion';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @Column({ length: 50, nullable: true })
  firstName!: string;

  @Column({ length: 50, nullable: true })
  lastName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 20, default: 'student' })
  role!: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings!: object;

  @OneToMany(() => UserSkillLevel, userSkillLevel => userSkillLevel.user)
  skillLevels!: UserSkillLevel[];

  @OneToMany(() => RecentQuestion, recentQuestion => recentQuestion.user)
  recentQuestions!: RecentQuestion[];
}
