// src/book.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BookService } from './book.service.js';

@ApiTags('books')
@Controller('books') // 이 컨트롤러로 들어오는 기본 주소: /books
export class BookController {
  // 주방장(BookService)을 주입받습니다.
  constructor(private readonly bookService: BookService) {}

  // GET http://localhost:3000/books
  @Get()
  async getBooks(): Promise<any> {
    return await this.bookService.getAllBooks();
  }

  // POST http://localhost:3000/books
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'number', example: 1 },
        title: { type: 'string', example: '클린 코드' },
        description: { type: 'string', example: '애자일 소프트웨어 장인 정신' },
      },
    },
  })
  @Post()
  async createBook(@Body() body: Record<string, any>): Promise<string> {
    return await this.bookService.createBook(body);
  }

  // 미션 1: GET http://localhost:3000/books/category/1
  @Get('category/:categoryId')
  async getBooksByCategory(@Param('categoryId') categoryId: string): Promise<any> {
    return await this.bookService.getBooksByCategory(Number(categoryId));
  }
}
