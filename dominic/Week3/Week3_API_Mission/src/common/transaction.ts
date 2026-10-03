import { Logger } from '@nestjs/common';
import type { Pool, PoolConnection } from 'mysql2/promise';

export async function transaction<T>(pool: Pool, operation: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      Logger.error('트랜잭션 롤백 실패', 'Database');
    }
    throw error;
  } finally {
    connection.release();
  }
}
