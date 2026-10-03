import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class BookRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {}

  async ping() {
    await this.pool.execute('SELECT 1');
  }

  async findAll(): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM book ORDER BY book_id DESC',
    );
    return rows;
  }

  async categoryExists(categoryId: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT category_id FROM category WHERE category_id = ?', [categoryId],
    );
    return rows.length > 0;
  }

  // 필수 1: WHERE category_id = ?로 해당 카테고리의 모든 도서를 조회합니다.
  async findByCategory(categoryId: number): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM book WHERE category_id = ? ORDER BY book_id DESC', [categoryId],
    );
    return rows;
  }

  async create(categoryId: number, title: string, description: string | null): Promise<RowDataPacket> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO book (category_id, title, description, is_available) VALUES (?, ?, ?, TRUE)',
      [categoryId, title, description],
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM book WHERE book_id = ?', [result.insertId],
    );
    return rows[0];
  }
}
