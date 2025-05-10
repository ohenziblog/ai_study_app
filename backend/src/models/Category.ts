import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, RelationId } from 'typeorm';
import { Skill } from './Skill';
import { RecentQuestion } from './RecentQuestion';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  categoryId!: number;

  @Column({ length: 100 })
  categoryName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @RelationId((category: Category) => category.parent)
  parentId!: number;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @Column({ default: 0 })
  level!: number;

  @Column({ type: 'ltree', nullable: true })
  path!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'tsvector', nullable: true })
  searchVector!: string;

  @OneToMany(() => Skill, skill => skill.category)
  skills!: Skill[];

  @OneToMany(() => RecentQuestion, recentQuestion => recentQuestion.category)
  recentQuestions!: RecentQuestion[];
}
