// src/rental.service.ts
import { Injectable } from '@nestjs/common';
import { RentalRepository } from './rental.repository.js';

@Injectable()
export class RentalService {
  constructor(private readonly rentalRepository: RentalRepository) {}

  async createRental(body: Record<string, any>): Promise<string> {
    await this.rentalRepository.create(body.userId, body.bookId);
    return '대여 기록이 생성되었습니다!';
  }

  async returnRental(rentalId: number): Promise<string> {
    await this.rentalRepository.markReturned(rentalId);
    return '반납 처리가 완료되었습니다!';
  }
}
