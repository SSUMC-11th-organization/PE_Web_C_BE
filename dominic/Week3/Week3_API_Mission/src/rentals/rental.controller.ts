import { Body, Controller, Headers, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { RentalService } from './rental.service';
import { jsonRequest, pathId } from '../common/input';

@Controller('rentals')
export class RentalController {
  constructor(private readonly service: RentalService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: Record<string, unknown>, @Headers('content-type') contentType: string | undefined) {
    jsonRequest(contentType);
    return this.service.create(body);
  }

  @Patch(':rentalId/return')
  @HttpCode(200)
  returnBook(@Param('rentalId') rentalId: string) {
    return this.service.returnBook(pathId(rentalId, 'rentalId'));
  }
}
