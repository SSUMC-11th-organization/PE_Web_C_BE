function readPort(name, fallback) {
  const raw = process.env[name] ?? String(fallback);
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name}은 1~65535 사이의 정수여야 합니다.`);
  }
  return value;
}

export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: readPort('PORT', 3000),
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: readPort('DB_PORT', 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'umc_sql_week2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 100,
    connectTimeout: 10000,
    charset: 'utf8mb4',
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: false,
    multipleStatements: false,
  },
};
