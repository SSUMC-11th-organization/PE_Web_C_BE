import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { databaseProviders } from './database.provider.js';
import { BookController } from './book.controller.js';
import { BookService } from './book.service.js';
import { BookRepository } from './book.repository.js';
import { RentalController } from './rental.controller.js';
import { RentalService } from './rental.service.js';
import { RentalRepository } from './rental.repository.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'week3-backend',
    }),
  ],
  controllers: [AppController, BookController, RentalController],
  providers: [
    ...databaseProviders,
    AppService,
    BookService,
    BookRepository,
    RentalService,
    RentalRepository,
  ],
  exports: [...databaseProviders],
})
export class AppModule {}
