import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity({ name: 'book' })
export class Book {
  @PrimaryGeneratedColumn({ name: 'book_id', type: 'bigint' })
  bookId!: string;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId!: string;

  @Column({ name: 'title', type: 'varchar', length: 100 })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @ManyToOne(() => Category, (category) => category.books, { nullable: false })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category!: Relation<Category>;
}
