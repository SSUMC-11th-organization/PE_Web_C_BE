import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { BookResponseDto } from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { FindBooksQueryDto } from './dto/find-books-query.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: FindBooksQueryDto): Promise<BookResponseDto[]> {
    return this.booksService.findAll(query.keyword);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    return this.booksService.create(dto);
  }
}
