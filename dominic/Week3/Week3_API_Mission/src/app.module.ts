import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BookController } from './books/book.controller';
import { BookService } from './books/book.service';
import { BookRepository } from './books/book.repository';
import { RentalController } from './rentals/rental.controller';
import { RentalService } from './rentals/rental.service';
import { RentalRepository } from './rentals/rental.repository';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [BookController, RentalController, HealthController],
  providers: [BookService, BookRepository, RentalService, RentalRepository],
})
export class AppModule {}
