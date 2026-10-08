import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';

function escapeLikeKeyword(keyword: string): string {
  // MySQL LIKE의 %, _, \를 검색어의 문자 그대로 처리한다.
  return keyword.replace(/[\\%_]/g, (character) => `\\${character}`);
}

@Injectable()
export class BookRepository {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  findAll(keyword?: string): Promise<Book[]> {
    return this.repository.find({
      where: keyword === undefined ? {} : { title: Like(`%${escapeLikeKeyword(keyword)}%`) },
      relations: { category: true },
      relationLoadStrategy: 'join',
      order: { bookId: 'DESC' },
    });
  }

  createAndSave(dto: CreateBookDto, category: Category): Promise<Book> {
    const book = this.repository.create({
      categoryId: category.categoryId,
      category,
      title: dto.title,
      description: dto.description ?? null,
      isAvailable: true,
    });
    return this.repository.save(book);
  }
}
