import { Inject, Injectable } from '@nestjs/common';
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DATABASE_CONNECTION } from '../database/database.module';

type Connection = Pool | PoolConnection;

@Injectable()
export class RentalRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {}

  async userExists(connection: Connection, userId: number): Promise<boolean> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT user_id FROM users WHERE user_id = ?', [userId],
    );
    return rows.length > 0;
  }

  async lockBook(connection: PoolConnection, bookId: number | string): Promise<RowDataPacket | undefined> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT book_id, is_available FROM book WHERE book_id = ? FOR UPDATE', [bookId],
    );
    return rows[0];
  }

  async activeRentals(connection: PoolConnection, bookId: number | string): Promise<RowDataPacket[]> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT rental_id FROM rental WHERE book_id = ? AND returned_at IS NULL FOR UPDATE', [bookId],
    );
    return rows;
  }

  // 필수 2: NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)를 사용합니다.
  async create(connection: PoolConnection, userId: number, bookId: number): Promise<number> {
    const [result] = await connection.execute<ResultSetHeader>(`
      INSERT INTO rental (user_id, book_id, rented_at, due_at, returned_at)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NULL)
    `, [userId, bookId]);
    return result.insertId;
  }

  async findById(rentalId: number, connection: Connection = this.pool, lock = false): Promise<RowDataPacket | undefined> {
    const sql = 'SELECT * FROM rental WHERE rental_id = ?' + (lock ? ' FOR UPDATE' : '');
    const [rows] = await connection.execute<RowDataPacket[]>(sql, [rentalId]);
    return rows[0];
  }

  async setBookAvailability(connection: PoolConnection, bookId: number | string, available: boolean) {
    await connection.execute('UPDATE book SET is_available = ? WHERE book_id = ?', [available, bookId]);
  }

  // 선택 미션: 반납 시각을 현재 시각으로 갱신합니다.
  async markReturned(connection: PoolConnection, rentalId: number) {
    await connection.execute('UPDATE rental SET returned_at = NOW() WHERE rental_id = ?', [rentalId]);
  }
}
