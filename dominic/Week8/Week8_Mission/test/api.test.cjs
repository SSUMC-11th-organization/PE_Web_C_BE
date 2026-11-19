const { test } = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const { jwtOptions } = require('../dist/auth/jwt.config');
const { ConfigService } = require('@nestjs/config');
const base = process.env.TEST_API_URL || 'http://127.0.0.1:3007';
const run = Date.now().toString();
const password = 'Study!1234';
let a, b, tokenA, tokenB, ratingId;
async function req(method,path,body,token) {
 const response=await fetch(base+path,{method,headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const text=await response.text();return {status:response.status,body:text?JSON.parse(text):null};
}
function err(r,status,code){assert.equal(r.status,status);assert.deepEqual({isSuccess:r.body.isSuccess,code:r.body.code,result:r.body.result},{isSuccess:false,code,result:null});}
test('security settings reject missing secret or invalid expiry',()=>{
 assert.throws(()=>jwtOptions(new ConfigService({JWT_SECRET:'short'})));
 assert.throws(()=>jwtOptions(new ConfigService({JWT_SECRET:'a'.repeat(32),JWT_ACCESS_EXPIRATION:'0'})));
});
test('complete two-member authentication scenario',async t=>{
 await t.test('1. register A and B without passwords in responses',async()=>{
  for (const [suffix,set] of [['a',x=>a=x],['b',x=>b=x]]) {
   const email=`w8${run}${suffix}@example.com`, nickname=`${suffix}${run.slice(-9)}`;
   const r=await req('POST','/members',{email,nickname,password});assert.equal(r.status,201);assert.equal('password' in r.body.result,false);set(r.body.result);
  }
 });
 await t.test('2. login and verify signed JWT claims',async()=>{
  const loginA=await req('POST','/auth/login',{email:a.email,password});const loginB=await req('POST','/auth/login',{email:b.email,password});
  assert.equal(loginA.status,200);assert.equal(loginB.status,200);tokenA=loginA.body.result.accessToken;tokenB=loginB.body.result.accessToken;
  const payload=jwt.verify(tokenA,process.env.JWT_SECRET,{algorithms:['HS256']});assert.equal(payload.sub,String(a.memberId));assert.equal(payload.email,a.email);assert.equal(payload.exp-payload.iat,3600);assert.equal(payload.password,undefined);
  const wrong=await req('POST','/auth/login',{email:a.email,password:'Wrong!1234'}), absent=await req('POST','/auth/login',{email:`missing${run}@example.com`,password});
  err(wrong,401,'AUTH401_1');assert.deepEqual(wrong,absent);
 });
 await t.test('profile view and own/someone else nickname update',async()=>{
  const r=await req('GET','/members/me',undefined,tokenA);assert.equal(r.status,200);assert.equal(r.body.result.email,a.email);assert.equal(r.body.result.password,undefined);
  assert.equal((await req('PATCH','/members/me',{nickname:a.nickname},tokenA)).status,200);
  err(await req('PATCH','/members/me',{nickname:b.nickname},tokenA),409,'MEMBER409_1');
  const changed=await req('PATCH','/members/me',{nickname:`c${run.slice(-9)}`},tokenA);assert.equal(changed.status,200);assert.equal(changed.body.result.nickname,`c${run.slice(-9)}`);
  err(await req('PATCH','/members/me',{nickname:'x'},tokenA),400,'COMMON400');
 });
 await t.test('3. rating creation uses token; supplied memberId rejected',async()=>{
  err(await req('POST','/ratings',{memberId:b.memberId,movieId:123,score:4},tokenA),400,'COMMON400');
  const r=await req('POST','/ratings',{movieId:123,score:4,comment:'처음 후기'},tokenA);assert.equal(r.status,201);ratingId=r.body.result.ratingId;
  const publicList=await req('GET',`/members/${a.memberId}/ratings`);assert.equal(publicList.status,200);assert.equal(publicList.body.result[0].ratingId,ratingId);
  const old=await req('POST',`/members/${b.memberId}/ratings`,{movieId:124,score:5},tokenA);assert.equal(old.status,404);
 });
 await t.test('4. duplicate rating',async()=>err(await req('POST','/ratings',{movieId:123,score:5},tokenA),409,'RATING409_1'));
 await t.test('5. owner update persists',async()=>{
  assert.equal((await req('PATCH',`/ratings/${ratingId}`,{score:5,comment:'수정 후기'},tokenA)).status,200);
  assert.equal((await req('GET',`/members/${a.memberId}/ratings`)).body.result[0].score,5);
 });
 await t.test('6. another user cannot update or delete',async()=>{
  err(await req('PATCH',`/ratings/${ratingId}`,{score:1},tokenB),403,'RATING403_1');
  err(await req('DELETE',`/ratings/${ratingId}`,undefined,tokenB),403,'RATING403_1');
  assert.equal((await req('GET',`/members/${a.memberId}/ratings`)).body.result[0].score,5);
 });
 await t.test('7. absent, tampered, unsigned, wrong algorithm and expired tokens',async()=>{
  err(await req('GET','/members/me'),401,'AUTH401_2');
  err(await req('PATCH',`/ratings/${ratingId}`,{score:1}),401,'AUTH401_2');
  const [header,payload,signature]=tokenA.split('.');const altered=JSON.parse(Buffer.from(payload,'base64url'));altered.sub=String(b.memberId);
  err(await req('GET','/members/me',undefined,[header,Buffer.from(JSON.stringify(altered)).toString('base64url'),signature].join('.')),401,'AUTH401_3');
  const claims={sub:String(a.memberId),email:a.email};
  for(const token of [jwt.sign(claims,'',{algorithm:'none',expiresIn:60}),jwt.sign(claims,process.env.JWT_SECRET,{algorithm:'HS384',expiresIn:60}),jwt.sign(claims,'different-secret',{expiresIn:60}),jwt.sign({email:a.email},process.env.JWT_SECRET,{expiresIn:60})]) err(await req('GET','/members/me',undefined,token),401,'AUTH401_3');
  err(await req('GET','/members/me',undefined,jwt.sign(claims,process.env.JWT_SECRET,{expiresIn:-1})),401,'AUTH401_4');
 });
 await t.test('8. missing rating',async()=>err(await req('DELETE','/ratings/99999999',undefined,tokenA),404,'RATING404_1'));
 await t.test('9. owner delete and public empty list',async()=>{
  const r=await req('DELETE',`/ratings/${ratingId}`,undefined,tokenA);assert.equal(r.status,200);assert.equal(r.body.result,null);assert.equal(r.body.code,'COMMON200');assert.deepEqual((await req('GET',`/members/${a.memberId}/ratings`)).body.result,[]);
 });
 await t.test('database values, hashed password, and CORS authorization preflight',async()=>{
  const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
  try{const [[row]]=await db.execute('SELECT password FROM member WHERE member_id=?',[a.memberId]);assert.equal(row.password.length,60);assert.notEqual(row.password,password);}finally{await db.end();}
  const r=await fetch(base+'/ratings',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:5177','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'}});assert.equal(r.headers.get('access-control-allow-origin'),'http://127.0.0.1:5177');assert.match(r.headers.get('access-control-allow-headers'),/authorization/i);
 });
});
