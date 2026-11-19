const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const mysql = require('mysql2/promise');
const { QueryFailedError } = require('typeorm');
const { mapDatabaseError } = require('../dist/common/api-exception.filter');
const base = process.env.TEST_API_URL || 'http://127.0.0.1:3007';
const run = Date.now().toString();
const evidence = [];
let a, b, tokenA, tokenB, db;

async function request(method, path, body, token, capture = true) {
  const response = await fetch(base + path, { method, headers: {
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = { status: response.status, body: await response.json() };
  if (capture) evidence.push({ method, path, request: body ?? null, authenticated: !!token, ...result });
  return result;
}
function error(response, status, code) {
  assert.equal(response.status, status);
  assert.equal(response.body.isSuccess, false);
  assert.equal(response.body.code, code);
  assert.equal(response.body.result, null);
}
async function counts(memberId, movieId) {
  const [[rating]] = await db.execute('SELECT COUNT(*) n FROM rating WHERE member_id=? AND movie_id=?', [memberId, movieId]);
  const [[favorite]] = await db.execute('SELECT COUNT(*) n FROM favorite WHERE member_id=? AND movie_id=?', [memberId, movieId]);
  return { ratings: rating.n, favorites: favorite.n };
}

test('week8 favorites, transactions and Swagger against MySQL', async t => {
  db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  try {
    for (const who of ['A', 'B']) {
      const email = `w8fav${run}${who}@example.com`;
      const member = await request('POST', '/members', { email, nickname: who + 'f' + run.slice(-8), password: 'Study!1234' }, null, false);
      assert.equal(member.status, 201);
      const login = await request('POST', '/auth/login', { email, password: 'Study!1234' }, null, false);
      assert.equal(login.status, 200);
      if (who === 'A') { a = member.body.result; tokenA = login.body.result.accessToken; }
      else { b = member.body.result; tokenB = login.body.result.accessToken; }
    }

    await t.test('all five routes require authentication', async () => {
      for (const [method, path, body] of [['POST', '/favorites', { movieId: 550 }], ['GET', '/favorites'], ['GET', '/favorites/550'], ['DELETE', '/favorites/550'], ['POST', '/movie-records', { movieId: 238, score: 5, addToFavorites: true }]]) {
        error(await request(method, path, body), 401, 'AUTH401_2');
        error(await request(method, path, body, 'invalid-token'), 401, 'AUTH401_3');
      }
    });

    await t.test('empty list and absent status are normal; invalid input and memberId rejected', async () => {
      assert.deepEqual((await request('GET', '/favorites', undefined, tokenA)).body.result, []);
      assert.deepEqual((await request('GET', '/favorites/550', undefined, tokenA)).body.result, { isFavorite: false });
      for (const movieId of [0, -1, 1.5, '550', Number.MAX_SAFE_INTEGER + 1]) error(await request('POST', '/favorites', { movieId }, tokenA), 400, 'COMMON400');
      for (const movieId of ['0', '-1', 'abc', '1.2', '9007199254740992']) error(await request('GET', '/favorites/' + movieId, undefined, tokenA), 400, 'COMMON400');
      error(await request('POST', '/favorites', { movieId: 550, memberId: b.memberId }, tokenA), 400, 'COMMON400');
    });

    await t.test('create, duplicate, newest-first list and another member are isolated', async () => {
      const r = await request('POST', '/favorites', { movieId: 550 }, tokenA);
      assert.equal(r.status, 201); assert.equal(r.body.code, 'COMMON201'); assert.equal(r.body.result.movieId, 550);
      error(await request('POST', '/favorites', { movieId: 550 }, tokenA), 409, 'FAVORITE409_1');
      await request('POST', '/favorites', { movieId: 680 }, tokenA);
      assert.deepEqual((await request('GET', '/favorites?memberId=' + b.memberId, undefined, tokenA)).body.result.map(x => x.movieId), [680, 550]);
      assert.deepEqual((await request('GET', '/favorites', undefined, tokenB)).body.result, []);
      assert.equal((await request('GET', '/favorites/550', undefined, tokenA)).body.result.isFavorite, true);
      error(await request('DELETE', '/favorites/550', undefined, tokenB), 404, 'FAVORITE404_1');
      assert.equal((await request('POST', '/favorites', { movieId: 550 }, tokenB)).status, 201);
    });

    await t.test('delete returns 200 and null; deleting again returns 404', async () => {
      const r = await request('DELETE', '/favorites/550', undefined, tokenA);
      assert.equal(r.status, 200); assert.equal(r.body.code, 'COMMON200'); assert.equal(r.body.result, null);
      assert.equal((await request('GET', '/favorites/550', undefined, tokenA)).body.result.isFavorite, false);
      assert.equal((await request('GET', '/favorites/550', undefined, tokenB)).body.result.isFavorite, true);
      error(await request('DELETE', '/favorites/550', undefined, tokenA), 404, 'FAVORITE404_1');
    });

    await t.test('movie record commits rating and favorite together; repeated request adds neither', async () => {
      const r = await request('POST', '/movie-records', { movieId: 238, score: 5, comment: '다시 보고 싶은 영화입니다.', addToFavorites: true }, tokenA);
      assert.equal(r.status, 201); assert.equal(r.body.code, 'COMMON201');
      assert.equal(r.body.result.rating.movieId, 238); assert.equal(r.body.result.favorite.movieId, 238);
      assert.deepEqual(await counts(a.memberId, 238), { ratings: 1, favorites: 1 });
      error(await request('POST', '/movie-records', { movieId: 238, score: 5, addToFavorites: true }, tokenA), 409, 'RATING409_1');
      assert.deepEqual(await counts(a.memberId, 238), { ratings: 1, favorites: 1 });
      assert.deepEqual(await counts(b.memberId, 238), { ratings: 0, favorites: 0 });
    });

    await t.test('existing favorite conflicts only when adding; false saves rating with favorite null', async () => {
      await request('POST', '/favorites', { movieId: 876 }, tokenA);
      error(await request('POST', '/movie-records', { movieId: 876, score: 4, addToFavorites: true }, tokenA), 409, 'FAVORITE409_1');
      assert.deepEqual(await counts(a.memberId, 876), { ratings: 0, favorites: 1 });
      const r = await request('POST', '/movie-records', { movieId: 876, score: 4, addToFavorites: false }, tokenA);
      assert.equal(r.status, 201); assert.equal(r.body.result.favorite, null);
      assert.deepEqual(await counts(a.memberId, 876), { ratings: 1, favorites: 1 });
      const only = await request('POST', '/movie-records', { movieId: 877, score: 4, addToFavorites: false }, tokenA);
      assert.equal(only.body.result.favorite, null);
      assert.deepEqual(await counts(a.memberId, 877), { ratings: 1, favorites: 0 });
    });

    await t.test('strict movie record validation', async () => {
      for (const body of [{ movieId: 999, score: 5 }, { movieId: 999, score: 0, addToFavorites: true }, { movieId: 999, score: 5, addToFavorites: 'true' }, { movieId: 999, score: 5, comment: {}, addToFavorites: true }, { movieId: 999, score: 5, addToFavorites: true, memberId: b.memberId }]) error(await request('POST', '/movie-records', body, tokenA), 400, 'COMMON400');
    });

    await t.test('real second INSERT failure rolls back the first INSERT', async () => {
      // Only this dedicated local learning DB may receive the temporary test trigger.
      assert.equal(process.env.DB_NAME, 'umc_movie_week8');
      const before = await counts(a.memberId, 909090);
      assert.deepEqual(before, { ratings: 0, favorites: 0 });
      await db.query("CREATE TRIGGER week8_test_favorite_failure BEFORE INSERT ON favorite FOR EACH ROW BEGIN IF NEW.movie_id=909090 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='week8 rollback test'; END IF; END");
      try {
        error(await request('POST', '/movie-records', { movieId: 909090, score: 5, addToFavorites: true }, tokenA), 500, 'COMMON500');
        const after = await counts(a.memberId, 909090);
        assert.deepEqual(after, before);
        evidence.push({ check: 'rollback after favorite INSERT failure', before, after });
      } finally { await db.query('DROP TRIGGER week8_test_favorite_failure'); }
      assert.equal((await request('POST', '/movie-records', { movieId: 909090, score: 5, addToFavorites: true }, tokenA)).status, 201);
    });

    await t.test('concurrent requests and database UNIQUE preserve a single favorite', async () => {
      const results = await Promise.all(Array.from({ length: 8 }, () => request('POST', '/favorites', { movieId: 280 }, tokenA)));
      assert.equal(results.filter(r => r.status === 201).length, 1);
      for (const r of results.filter(r => r.status !== 201)) error(r, 409, 'FAVORITE409_1');
      assert.deepEqual(await counts(a.memberId, 280), { ratings: 0, favorites: 1 });
      await assert.rejects(db.execute('INSERT INTO favorite (member_id,movie_id) VALUES (?,?)', [a.memberId, 280]), err => {
        assert.equal(err.code, 'ER_DUP_ENTRY');
        const mapped = mapDatabaseError(new QueryFailedError('INSERT', [], err));
        assert.equal(mapped.getStatus(), 409); assert.equal(mapped.getResponse().code, 'FAVORITE409_1');
        return true;
      });
    });

    await t.test('Swagger documents five protected routes, public login and response examples', async () => {
      const response = await fetch(base + '/docs-json'); assert.equal(response.status, 200);
      const spec = await response.json(); assert.equal(spec.components.securitySchemes.bearer.scheme, 'bearer');
      for (const [path, method] of [['/favorites', 'post'], ['/favorites', 'get'], ['/favorites/{movieId}', 'get'], ['/favorites/{movieId}', 'delete'], ['/movie-records', 'post']]) {
        const op = spec.paths[path][method]; assert.deepEqual(op.security, [{ bearer: [] }]);
        assert.ok(op.responses['401'].content['application/json'].examples.AUTH401_2);
      }
      assert.deepEqual(spec.paths['/auth/login'].post.security, []);
      assert.deepEqual(spec.paths['/members'].post.security, []);
      assert.ok(spec.paths['/favorites'].post.responses['409'].content['application/json'].examples.FAVORITE409_1);
      assert.ok(spec.paths['/movie-records'].post.responses['201'].content['application/json'].example.result.favorite);
      assert.equal(spec.components.schemas.CreateMovieRecordDto.properties.addToFavorites.type, 'boolean');
      assert.match(await (await fetch(base + '/docs')).text(), /swagger-ui/);
    });
  } finally {
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/api-verification.json', JSON.stringify({ generatedAt: new Date().toISOString(), database: process.env.DB_NAME, evidence }, null, 2) + '\n');
    await db.end();
  }
});
