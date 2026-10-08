import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { CategoryRepository } from '../categories/category.repository';
import { Book } from './book.entity';
import { BookRepository } from './book.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category])],
  controllers: [BooksController],
  providers: [BooksService, BookRepository, CategoryRepository],
})
export class BooksModule {}
