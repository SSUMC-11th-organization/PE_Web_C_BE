import { Global, Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';
import { envPort } from '../common/input';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [{
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (config: ConfigService): Promise<Pool> => {
      const database = config.get<string>('DB_NAME', 'umc_sql_week2');
      const pool = createPool({
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: envPort(config.get<string>('DB_PORT', '3306'), 'DB_PORT'),
        user: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 100,
        connectTimeout: 10000,
        charset: 'utf8mb4',
        dateStrings: true,
        supportBigNumbers: true,
        multipleStatements: false,
      });
      try {
        await pool.execute('SELECT 1');
        Logger.log(`MySQL 연결 완료: ${database}`, 'Database');
        return pool;
      } catch (error) {
        await pool.end();
        throw error;
      }
    },
  }],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
