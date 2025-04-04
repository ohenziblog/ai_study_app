import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Skill } from './Skill';
import { RecentQuestion } from './RecentQuestion';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id!: number;

  @Column({ length: 100 })
  category_name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  parent_id!: number;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @Column({ default: 0 })
  level!: number;

  @Column({ type: 'ltree', nullable: true })
  path!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'search_vector', type: 'tsvector', nullable: true })
  searchVector!: string;

  @OneToMany(() => Skill, skill => skill.category)
  skills!: Skill[];

  @OneToMany(() => RecentQuestion, recentQuestion => recentQuestion.category)
  recentQuestions!: RecentQuestion[];
}
