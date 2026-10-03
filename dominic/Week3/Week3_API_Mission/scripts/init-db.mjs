import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { config } from './db-config.mjs';

const { database, ...options } = config.database;
if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(database)) {
  throw new Error('DB_NAME은 영문자로 시작하고 영문자·숫자·밑줄만 포함해야 합니다.');
}

// DDL 실행 전 대상 DB가 비어 있는지 검사해 기존 실습 데이터에 seed가 섞이지 않게 합니다.
const connection = await mysql.createConnection(options);
try {
  const [tables] = await connection.execute(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
    [database],
  );
  if (tables.length > 0) {
    throw new Error(`${database}에 테이블이 이미 있습니다. 기존 DB를 그대로 사용하거나 새로운 DB_NAME을 지정하세요.`);
  }
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${database}\``);
  for (const filename of ['01_schema.sql', '02_seed.sql']) {
    const sql = await readFile(new URL(`../sql/${filename}`, import.meta.url), 'utf8');
    // 위 SQL 파일에는 세미콜론이 들어간 문자열이나 프로시저가 없습니다.
    // 다중 SQL 실행 옵션을 열지 않고 한 문장씩 실행합니다.
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
      await connection.query(statement);
    }
    console.log(`${filename} 실행 완료`);
  }
  console.log(`${database} 준비 완료`);
} catch (error) {
  console.error('DB 초기화 실패:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
