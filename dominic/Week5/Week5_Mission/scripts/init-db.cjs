const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
 const name = process.env.DB_NAME || 'umc_movie_week5';
 if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('Invalid DB_NAME');
 const db = await mysql.createConnection({host:process.env.DB_HOST || '127.0.0.1',port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER || 'root',password:process.env.DB_PASSWORD || '',multipleStatements:true,charset:'utf8mb4'});
 try {
  await db.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await db.query(`USE \`${name}\``);
  const [tables] = await db.query('SHOW TABLES');
  if (tables.length) throw new Error('Database is not empty; initialization stopped without altering tables.');
  for (const file of ['schema.sql','seed.sql']) await db.query(fs.readFileSync(path.join(__dirname,'..','sql',file),'utf8'));
  console.log(`Initialized ${name}: member, rating, favorite and seed data.`);
 } finally { await db.end(); }
})().catch(e => {console.error(e.message); process.exitCode=1});
