import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../books/book.entity';

@Entity({ name: 'category' })
export class Category {
  // MySQL BIGINT는 내부에서 문자열로 보존해 정밀도 손실을 방지한다.
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'bigint' })
  categoryId!: string;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name!: string;

  @OneToMany(() => Book, (book) => book.category)
  books!: Book[];
}
