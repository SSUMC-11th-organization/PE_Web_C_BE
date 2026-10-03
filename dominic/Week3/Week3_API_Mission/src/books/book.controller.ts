import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { jsonRequest, pathId } from '../common/input';

@Controller('books')
export class BookController {
  constructor(private readonly service: BookService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.service.findByCategory(pathId(categoryId, 'categoryId'));
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @Headers('content-type') contentType: string | undefined) {
    jsonRequest(contentType);
    return this.service.create(body);
  }
}
