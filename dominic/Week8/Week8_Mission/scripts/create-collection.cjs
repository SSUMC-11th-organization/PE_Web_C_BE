const fs = require('node:fs');
const item = [];
function add(name, method, path, body, status, code, after = [], token) {
  const header = body ? [{ key: 'Content-Type', value: 'application/json' }] : [];
  if (token) header.push({ key: 'Authorization', value: `Bearer {{${token}}}` });
  item.push({ name, request: { method, header, url: '{{baseUrl}}' + path,
    ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}) },
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
      `pm.test('HTTP ${status}',()=>pm.response.to.have.status(${status}));`,
      'const responseData=pm.response.json();',
      `pm.test('code ${code}',()=>pm.expect(responseData.code).to.eql('${code}'));`, ...after,
    ] } }] });
}
for (const who of ['A', 'B']) {
  add(`회원 ${who} 가입`, 'POST', '/members', { email: `{{email${who}}}`, nickname: `{{nickname${who}}}`, password: 'Study!1234' }, 201, 'COMMON201');
  add(`회원 ${who} 로그인`, 'POST', '/auth/login', { email: `{{email${who}}}`, password: 'Study!1234' }, 200, 'COMMON200', [`pm.collectionVariables.set('token${who}',responseData.result.accessToken);`]);
}
add('토큰 누락', 'POST', '/favorites', { movieId: 550 }, 401, 'AUTH401_2');
add('빈 즐겨찾기 목록', 'GET', '/favorites', null, 200, 'COMMON200', ["pm.test('empty',()=>pm.expect(responseData.result).to.eql([]));"], 'tokenA');
add('즐겨찾기 등록', 'POST', '/favorites', { movieId: 550 }, 201, 'COMMON201', ["pm.test('movie',()=>pm.expect(responseData.result.movieId).to.eql(550));"], 'tokenA');
add('중복 즐겨찾기', 'POST', '/favorites', { movieId: 550 }, 409, 'FAVORITE409_1', [], 'tokenA');
add('목록 조회', 'GET', '/favorites', null, 200, 'COMMON200', ["pm.test('one favorite',()=>pm.expect(responseData.result.length).to.eql(1));"], 'tokenA');
add('여부 true', 'GET', '/favorites/550', null, 200, 'COMMON200', ["pm.test('true',()=>pm.expect(responseData.result.isFavorite).to.eql(true));"], 'tokenA');
add('다른 회원 목록', 'GET', '/favorites', null, 200, 'COMMON200', ["pm.test('isolated',()=>pm.expect(responseData.result).to.eql([]));"], 'tokenB');
add('다른 회원 해제 거절', 'DELETE', '/favorites/550', null, 404, 'FAVORITE404_1', [], 'tokenB');
add('즐겨찾기 해제', 'DELETE', '/favorites/550', null, 200, 'COMMON200', ["pm.test('null',()=>pm.expect(responseData.result).to.eql(null));"], 'tokenA');
add('여부 false', 'GET', '/favorites/550', null, 200, 'COMMON200', ["pm.test('false',()=>pm.expect(responseData.result.isFavorite).to.eql(false));"], 'tokenA');
add('없는 즐겨찾기 해제', 'DELETE', '/favorites/550', null, 404, 'FAVORITE404_1', [], 'tokenA');
add('평점과 즐겨찾기 동시 저장', 'POST', '/movie-records', { movieId: 238, score: 5, comment: '다시 보고 싶은 영화입니다.', addToFavorites: true }, 201, 'COMMON201', ["pm.test('both saved',()=>{pm.expect(responseData.result.rating.movieId).to.eql(238);pm.expect(responseData.result.favorite.movieId).to.eql(238);});"], 'tokenA');
add('평점 중복', 'POST', '/movie-records', { movieId: 238, score: 5, addToFavorites: true }, 409, 'RATING409_1', [], 'tokenA');
add('즐겨찾기 없이 평점만 저장', 'POST', '/movie-records', { movieId: 680, score: 4, addToFavorites: false }, 201, 'COMMON201', ["pm.test('favorite null',()=>pm.expect(responseData.result.favorite).to.eql(null));"], 'tokenA');
add('잘못된 영화 ID', 'POST', '/favorites', { movieId: 0 }, 400, 'COMMON400', [], 'tokenA');
const collection = {
  info: { name: 'UMC Week 8 즐겨찾기와 트랜잭션', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: 'http://127.0.0.1:3007' }],
  event: [{ listen: 'prerequest', script: { type: 'text/javascript', exec: [
    "if (!pm.collectionVariables.get('run')) { const run=Date.now().toString(); pm.collectionVariables.set('run',run); for(const who of ['A','B']) { pm.collectionVariables.set('email'+who,'postman8'+run+who+'@example.com'); pm.collectionVariables.set('nickname'+who,who+'p'+run.slice(-8)); } }",
  ] } }], item,
};
fs.mkdirSync('postman', { recursive: true });
fs.writeFileSync('postman/week8.postman_collection.json', JSON.stringify(collection, null, 2) + '\n');
