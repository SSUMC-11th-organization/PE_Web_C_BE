const { test } = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { QueryFailedError } = require('typeorm');
const { mapDatabaseError } = require('../dist/common/api-exception.filter');
const base = process.env.TEST_API_URL || 'http://127.0.0.1:3004';
const suffix = `${Date.now()}${Math.floor(Math.random()*1000)}`;
const email = `w6${suffix}@example.com`;
const nickname = `w${suffix.slice(-9)}`;
const password = 'Study!1234';
async function request(method, path, body) {
 const response = await fetch(base + path, {method, headers:body === undefined ? {} : {'Content-Type':'application/json'}, ...(body === undefined ? {} : {body: JSON.stringify(body)})});
 const text = await response.text(); return {status: response.status, body: text ? JSON.parse(text) : null, text};
}
function checkError(result, status, code) { assert.equal(result.status, status); assert.equal(result.body.isSuccess, false); assert.equal(result.body.code, code); assert.equal(result.body.result, null); }
test('signup, race, CRUD and validation through HTTP and MySQL', async () => {
 const db = await mysql.createConnection({host:process.env.DB_HOST || '127.0.0.1',port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER || 'root',password:process.env.DB_PASSWORD || '',database:process.env.DB_NAME || 'umc_movie_week6'});
 try {
  const reg = await request('POST','/members',{email,nickname,password});
  assert.equal(reg.status,201); assert.equal(reg.body.isSuccess,true); assert.equal(reg.body.code,'COMMON201'); assert.equal(reg.body.result.email,email); assert.equal('password' in reg.body.result,false);
  const memberId=reg.body.result.memberId;
  const [rows] = await db.execute('SELECT password FROM member WHERE member_id=?',[memberId]);
  assert.notEqual(rows[0].password,password); assert.equal(rows[0].password.length,60); assert.equal(await bcrypt.compare(password, rows[0].password),true);
  checkError(await request('POST','/members',{email,nickname:`v${suffix.slice(-9)}`,password}),409,'MEMBER4091');
  checkError(await request('POST','/members',{email:`alt${suffix}@example.com`,nickname,password}),409,'MEMBER4092');
  checkError(await request('POST','/members',{email:'wrong',nickname:'ab',password:'weak'}),400,'COMMON400');
  checkError(await request('POST','/members',{email:`long${suffix}@example.com`,nickname:'good',password:'Ab1!'+ '가'.repeat(25)}),400,'COMMON400');
  const raceEmail=`race${suffix}@example.com`;
  const race=await Promise.all(Array.from({length:8},(_,i)=>request('POST','/members',{email:raceEmail,nickname:`r${i}${suffix.slice(-8)}`,password})));
  assert.equal(race.filter(r=>r.status===201).length,1); assert.equal(race.filter(r=>r.status===409 && r.body.code==='MEMBER4091').length,7);
  const [[count]] = await db.execute('SELECT COUNT(*) AS count FROM member WHERE email=?',[raceEmail]); assert.equal(count.count,1);
  // Exercise a real MySQL UNIQUE violation and verify the global filter mapping.
  let duplicate;
  try { await db.execute('INSERT INTO member (email,nickname,password) VALUES (?,?,?)',[email,`d${suffix.slice(-8)}`,rows[0].password]); } catch (e) { duplicate=e; }
  assert.equal(duplicate?.code,'ER_DUP_ENTRY');
  const mapped=mapDatabaseError(new QueryFailedError('INSERT', [], duplicate)); assert.equal(mapped?.getStatus(),409); assert.equal(mapped?.getResponse().code,'MEMBER4091');
  let duplicateNickname;
  try { await db.execute('INSERT INTO member (email,nickname,password) VALUES (?,?,?)',[`unique${suffix}@example.com`,nickname,rows[0].password]); } catch (e) { duplicateNickname=e; }
  assert.equal(duplicateNickname?.code,'ER_DUP_ENTRY');
  assert.equal(mapDatabaseError(new QueryFailedError('INSERT', [], duplicateNickname))?.getResponse().code,'MEMBER4092');
  const create=await request('POST',`/members/${memberId}/ratings`,{movieId:424242,score:4,comment:'좋아요'});
  assert.equal(create.status,201); const ratingId=create.body.result; assert.ok(Number.isSafeInteger(ratingId));
  checkError(await request('POST',`/members/${memberId}/ratings`,{movieId:424242,score:3}),409,'RATING4091');
  let duplicateRating;
  try { await db.execute('INSERT INTO rating (member_id,movie_id,score) VALUES (?,?,?)',[memberId,424242,3]); } catch (e) { duplicateRating=e; }
  assert.equal(duplicateRating?.code,'ER_DUP_ENTRY');
  assert.equal(mapDatabaseError(new QueryFailedError('INSERT', [], duplicateRating))?.getResponse().code,'RATING4091');
  checkError(await request('POST',`/members/${memberId}/ratings`,{movieId:3,score:6}),400,'COMMON400');
  checkError(await request('POST',`/members/${memberId}/ratings`,{movieId:3,score:3,comment:'a'.repeat(501)}),400,'COMMON400');
  checkError(await request('POST','/members/99999999/ratings',{movieId:3,score:3}),404,'MEMBER404');
  checkError(await request('PATCH',`/members/1/ratings/${ratingId}`,{score:1}),403,'RATING403');
  checkError(await request('DELETE',`/members/1/ratings/${ratingId}`),403,'RATING403');
  checkError(await request('PATCH',`/members/${memberId}/ratings/99999999`,{score:1}),404,'RATING404');
  assert.equal((await request('PATCH',`/members/${memberId}/ratings/${ratingId}`,{score:5,comment:'정말 좋았습니다'})).status,200);
  const list=await request('GET',`/members/${memberId}/ratings`); assert.equal(list.body.result[0].score,5); assert.equal(list.body.result[0].comment,'정말 좋았습니다');
  const deleted=await request('DELETE',`/members/${memberId}/ratings/${ratingId}`); assert.equal(deleted.status,204); assert.equal(deleted.text,'');
  assert.deepEqual((await request('GET',`/members/${memberId}/ratings`)).body.result,[]);
  checkError(await request('DELETE',`/members/${memberId}/ratings/${ratingId}`),404,'RATING404');
  const preflight=await fetch(base+'/members',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:5177','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}}); assert.equal(preflight.headers.get('access-control-allow-origin'),'http://127.0.0.1:5177'); assert.match(preflight.headers.get('access-control-allow-methods'),/POST/);
 } finally { await db.end(); }
});
