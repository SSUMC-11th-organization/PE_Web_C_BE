const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = process.env.TEST_API_URL || 'http://127.0.0.1:3002';
async function get(path, options) { const response = await fetch(base + path, options); return { response, body: await response.json() }; }
test('duplicate checks and invalid inputs', async () => {
 for (const [path, status, available] of [
  ['/members/nickname/'+encodeURIComponent('수현'), 200, false],
  ['/members/nickname/'+encodeURIComponent('새로운회원'), 200, true],
  ['/members/nickname/a', 400],
  ['/members/nickname/'+encodeURIComponent('가'.repeat(13)), 400],
  ['/members/email/noco%40umc.com', 200, false],
  ['/members/email/new%40example.com', 200, true],
  ['/members/email/not-an-email', 400],
 ]) { const result = await get(path); assert.equal(result.response.status, status, path); if (available !== undefined) assert.equal(result.body.available, available, path); }
});
test('ratings pagination, legacy array, and bad requests', async () => {
 const all = await get('/members/1/ratings'); assert.equal(all.response.status, 200); assert.equal(all.body.length, 2);
 const first = await get('/members/1/ratings?page=0&size=1'); const second = await get('/members/1/ratings?page=1&size=1');
 assert.equal(first.body.totalElements, 2); assert.equal(first.body.totalPages, 2); assert.equal(first.body.content.length, 1); assert.notEqual(first.body.content[0].ratingId, second.body.content[0].ratingId);
 for (const [path, status] of [['/members/999/ratings',404], ['/members/0/ratings',400], ['/members/1/ratings?page=-1',400], ['/members/1/ratings?size=0',400]]) assert.equal((await get(path)).response.status, status);
});
test('CORS allows the configured origin and omits it for another', async () => {
 const allowed = await get('/members/nickname/test', { headers: { Origin:'http://127.0.0.1:5177' } });
 const denied = await get('/members/nickname/test', { headers: { Origin:'http://127.0.0.1:5178' } });
 assert.equal(allowed.response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5177');
 assert.equal(denied.response.headers.get('access-control-allow-origin'), null);
});
