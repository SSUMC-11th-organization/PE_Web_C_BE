import { Controller, Get } from '@nestjs/common';
import { BookRepository } from './books/book.repository';

@Controller()
export class HealthController {
  constructor(private readonly repository: BookRepository) {}

  @Get()
  index() {
    return { name: 'UMC 3주차 NestJS 도서 대여 API', endpoints: ['GET /books', 'POST /books', 'GET /books/category/:categoryId', 'POST /rentals', 'PATCH /rentals/:rentalId/return'] };
  }

  @Get('health')
  async health() {
    await this.repository.ping();
    return { status: 'ok', database: 'connected' };
  }
}
