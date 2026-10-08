import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../categories/category.repository';
import { BookRepository } from './book.repository';
import { BookResponseDto } from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAll(keyword?: string): Promise<BookResponseDto[]> {
    const books = await this.bookRepository.findAll(keyword);
    return books.map((book) => BookResponseDto.fromEntity(book));
  }

  async create(dto: CreateBookDto): Promise<BookResponseDto> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`카테고리 ${dto.categoryId}를 찾을 수 없습니다.`);
    }

    const book = await this.bookRepository.createAndSave(dto, category);
    return BookResponseDto.fromEntity(book);
  }
}
