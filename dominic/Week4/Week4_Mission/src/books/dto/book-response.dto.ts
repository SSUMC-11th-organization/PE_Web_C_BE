import { InternalServerErrorException } from '@nestjs/common';
import { Book } from '../book.entity';

export class BookResponseDto {
  readonly bookId: number;
  readonly title: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly isAvailable: boolean;

  private constructor(book: Book) {
    const bookId = Number(book.bookId);
    if (!Number.isSafeInteger(bookId) || bookId < 1) {
      throw new InternalServerErrorException('도서 ID가 응답 가능한 정수 범위를 초과했습니다.');
    }
    if (!book.category) {
      throw new InternalServerErrorException('도서의 카테고리 정보를 조회하지 못했습니다.');
    }

    this.bookId = bookId;
    this.title = book.title;
    this.description = book.description ?? null;
    this.categoryName = book.category.name;
    this.isAvailable = book.isAvailable;
  }

  static fromEntity(book: Book): BookResponseDto {
    return new BookResponseDto(book);
  }
}
