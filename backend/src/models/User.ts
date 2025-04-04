import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserSkillLevel } from './UserSkillLevel';
import { RecentQuestion } from './RecentQuestion';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'first_name', length: 50, nullable: true })
  firstName!: string;

  @Column({ name: 'last_name', length: 50, nullable: true })
  lastName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date;

  @Column({ name: 'is_active', default: true })
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
