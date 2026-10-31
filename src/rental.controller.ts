// src/rental.controller.ts
import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RentalService } from './rental.service.js';

@ApiTags('rentals')
@Controller('rentals')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  // POST http://localhost:3000/rentals   Body: { "userId": 1, "bookId": 2 }
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        bookId: { type: 'number', example: 1 },
      },
    },
  })
  @Post()
  async createRental(@Body() body: Record<string, any>): Promise<string> {
    return await this.rentalService.createRental(body);
  }

  // PATCH http://localhost:3000/rentals/1/return
  @Patch(':rentalId/return')
  async returnRental(@Param('rentalId') rentalId: string): Promise<string> {
    return await this.rentalService.returnRental(Number(rentalId));
  }
}
