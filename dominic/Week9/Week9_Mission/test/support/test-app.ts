import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from '../../src/auth/auth.module';
import { FavoritesModule } from '../../src/favorites/favorites.module';
import { MembersModule } from '../../src/members/members.module';
import { Member } from '../../src/entities/member.entity';
import { Rating } from '../../src/entities/rating.entity';
import { Favorite } from '../../src/entities/favorite.entity';
import { configureApp } from '../../src/app.setup';

// sql.js requires INTEGER PRIMARY KEY for AUTOINCREMENT. Keep this adapter in
// tests: production MySQL retains BIGINT, the same entities, relations and UNIQUEs.
class MemoryDataSource extends DataSource {
  protected async buildMetadatas(): Promise<void> {
    await super.buildMetadatas();
    for (const entity of this.entityMetadatas) {
      for (const column of entity.columns) {
        if (column.type !== 'bigint') continue;
        if (column.isGenerated && column.generationStrategy === 'increment') column.type = 'integer';
        column.transformer = { to: value => value, from: value => value == null ? value : String(value) };
      }
    }
  }
}

export async function createTestApp() {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({
        JWT_SECRET: 'week9-memory-test-secret-never-used-in-production', JWT_ACCESS_EXPIRATION: '3600',
      })] }),
      TypeOrmModule.forRootAsync({
        useFactory: () => ({ type: 'sqljs' as const, entities: [Member, Rating, Favorite], synchronize: true, autoSave: false }),
        dataSourceFactory: async options => new MemoryDataSource(options as DataSourceOptions).initialize(),
      }),
      MembersModule, AuthModule, FavoritesModule,
    ],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  return { app, dataSource: app.get(DataSource) };
}
