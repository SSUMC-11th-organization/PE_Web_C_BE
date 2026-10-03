import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DATABASE_CONNECTION } from '../database/database.module';
import { bodyId } from '../common/input';
import { transaction } from '../common/transaction';
import { RentalRepository } from './rental.repository';

@Injectable()
export class RentalService {
  constructor(
    private readonly repository: RentalRepository,
    @Inject(DATABASE_CONNECTION) private readonly pool: Pool,
  ) {}

  async create(body: Record<string, unknown>) {
    const userId = bodyId(body, 'userId');
    const bookId = bodyId(body, 'bookId');
    return transaction(this.pool, async (connection) => {
      if (!(await this.repository.userExists(connection, userId))) {
        throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
      }
      const book = await this.repository.lockBook(connection, bookId);
      if (!book) throw new NotFoundException('해당 도서를 찾을 수 없습니다.');
      if (!book.is_available) throw new ConflictException('현재 대여할 수 없는 도서입니다.');
      if ((await this.repository.activeRentals(connection, bookId)).length > 0) {
        throw new ConflictException('아직 반납되지 않은 대여 기록이 있습니다.');
      }
      const rentalId = await this.repository.create(connection, userId, bookId);
      await this.repository.setBookAvailability(connection, bookId, false);
      return this.repository.findById(rentalId, connection);
    });
  }

  async returnBook(rentalId: number) {
    const existing = await this.repository.findById(rentalId);
    if (!existing) throw new NotFoundException('해당 대여 기록을 찾을 수 없습니다.');
    const bookId = existing.book_id as number | string;

    return transaction(this.pool, async (connection) => {
      // 대여와 반납 모두 book → rental 순서로 잠급니다.
      const book = await this.repository.lockBook(connection, bookId);
      if (!book) throw new NotFoundException('대여한 도서를 찾을 수 없습니다.');
      const rental = await this.repository.findById(rentalId, connection, true);
      if (!rental) throw new NotFoundException('해당 대여 기록을 찾을 수 없습니다.');
      if (rental.returned_at !== null) throw new ConflictException('이미 반납 처리된 대여 기록입니다.');
      await this.repository.markReturned(connection, rentalId);
      const outstanding = await this.repository.activeRentals(connection, bookId);
      await this.repository.setBookAvailability(connection, bookId, outstanding.length === 0);
      return this.repository.findById(rentalId, connection);
    });
  }
}
