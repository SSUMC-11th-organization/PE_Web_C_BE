import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Member } from '../src/entities/member.entity';
import { Rating } from '../src/entities/rating.entity';
import { Favorite } from '../src/entities/favorite.entity';
import { createApiDocument } from '../src/app.setup';
import { createTestApp } from './support/test-app';

describe('실제 HTTP·JWT·검증·서비스·메모리 DB 통합 테스트', () => {
  let app: INestApplication;
  let db: DataSource;
  let token: string;
  let memberId: string;
  const ratingBody = { movieId: 550, score: 5, comment: '기억에 남는 영화' };
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => { ({ app, dataSource: db } = await createTestApp()); });
  afterAll(async () => { await app?.close(); });
  beforeEach(async () => {
    // A fresh in-memory schema prevents order dependencies; no developer DB is read.
    await db.synchronize(true);
    const registration = await request(app.getHttpServer()).post('/members')
      .send({ email: 'study@example.com', nickname: '도미닉', password: 'Study1234!' }).expect(201);
    memberId = String(registration.body.result.memberId);
    const login = await request(app.getHttpServer()).post('/auth/login')
      .send({ email: 'study@example.com', password: 'Study1234!' }).expect(200);
    token = login.body.result.accessToken;
  });

  it('토큰 없이 즐겨찾기를 등록하면 401 / AUTH401_2이고 DB가 비어 있다', async () => {
    const res = await request(app.getHttpServer()).post('/favorites').send({ movieId: 550 }).expect(401);
    expect(res.body.code).toBe('AUTH401_2');
    expect(await db.getRepository(Favorite).count()).toBe(0);
  });
  it('토큰으로 즐겨찾기를 등록하면 201 / COMMON201이고 movieId와 저장 결과가 일치한다', async () => {
    const res = await request(app.getHttpServer()).post('/favorites').set(auth()).send({ movieId: 550 }).expect(201);
    expect(res.body).toMatchObject({ isSuccess: true, code: 'COMMON201', result: { movieId: 550 } });
    expect(await db.getRepository(Favorite).count()).toBe(1);
  });
  it('즐겨찾기를 중복 등록하면 409 / FAVORITE409_1이고 한 건만 남는다', async () => {
    await request(app.getHttpServer()).post('/favorites').set(auth()).send({ movieId: 550 }).expect(201);
    const res = await request(app.getHttpServer()).post('/favorites').set(auth()).send({ movieId: 550 }).expect(409);
    expect(res.body.code).toBe('FAVORITE409_1');
    expect(await db.getRepository(Favorite).count()).toBe(1);
  });
  it('즐겨찾기하지 않은 영화도 200 / COMMON200과 isFavorite false를 반환한다', async () => {
    const res = await request(app.getHttpServer()).get('/favorites/550').set(auth()).expect(200);
    expect(res.body).toMatchObject({ code: 'COMMON200', result: { isFavorite: false } });
  });
  it('토큰 없이 평점을 등록하면 401 / AUTH401_2이고 평점이 남지 않는다', async () => {
    const res = await request(app.getHttpServer()).post('/ratings').send(ratingBody).expect(401);
    expect(res.body.code).toBe('AUTH401_2');
    expect(await db.getRepository(Rating).count()).toBe(0);
  });
  it('토큰으로 평점을 등록하면 201 / COMMON201과 ratingId를 반환하고 본인 평점이 저장된다', async () => {
    const res = await request(app.getHttpServer()).post('/ratings').set(auth()).send(ratingBody).expect(201);
    expect(res.body.code).toBe('COMMON201');
    expect(res.body.result.ratingId).toEqual(expect.any(Number));
    const saved = await db.getRepository(Rating).findOneOrFail({ where: { ratingId: String(res.body.result.ratingId) }, relations: { member: true } });
    expect(saved.member.memberId).toBe(memberId);
    expect(saved.score).toBe(5);
  });
  it('같은 영화 평점을 다시 등록하면 409 / RATING409_1이고 한 건만 남는다', async () => {
    await request(app.getHttpServer()).post('/ratings').set(auth()).send(ratingBody).expect(201);
    const res = await request(app.getHttpServer()).post('/ratings').set(auth()).send(ratingBody).expect(409);
    expect(res.body.code).toBe('RATING409_1');
    expect(await db.getRepository(Rating).count()).toBe(1);
  });
  it('다른 회원이 평점을 수정하면 403 / RATING403_1이고 점수가 유지된다', async () => {
    const created = await request(app.getHttpServer()).post('/ratings').set(auth()).send(ratingBody).expect(201);
    await request(app.getHttpServer()).post('/members').send({ email: 'other@example.com', nickname: '다른회원', password: 'Study1234!' }).expect(201);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email: 'other@example.com', password: 'Study1234!' }).expect(200);
    const res = await request(app.getHttpServer()).patch(`/ratings/${created.body.result.ratingId}`)
      .auth(login.body.result.accessToken, { type: 'bearer' }).send({ score: 1 }).expect(403);
    expect(res.body.code).toBe('RATING403_1');
    expect((await db.getRepository(Rating).findOneByOrFail({ ratingId: String(created.body.result.ratingId) })).score).toBe(5);
  });
  it('기존 즐겨찾기와 충돌하면 409 / FAVORITE409_1이고 먼저 INSERT한 평점도 롤백한다', async () => {
    // given: favorite exists, rating does not.
    await request(app.getHttpServer()).post('/favorites').set(auth()).send({ movieId: 550 }).expect(201);
    const before = await db.getRepository(Rating).count();
    // when: the second step fails after the rating INSERT.
    const res = await request(app.getHttpServer()).post('/movie-records').set(auth())
      .send({ ...ratingBody, addToFavorites: true }).expect(409);
    // then: HTTP failure alone is insufficient; verify persisted state as well.
    expect(res.body.code).toBe('FAVORITE409_1');
    expect(await db.getRepository(Rating).count()).toBe(before);
    expect(await db.getRepository(Rating).countBy({ member: { memberId }, movieId: '550' })).toBe(0);
    expect(await db.getRepository(Favorite).count()).toBe(1);
  });
  it('영화 기록 성공 시 평점·즐겨찾기를 함께 저장하고 false일 때 평점만 추가한다', async () => {
    const res = await request(app.getHttpServer()).post('/movie-records').set(auth()).send({ ...ratingBody, addToFavorites: true }).expect(201);
    expect(res.body.result).toMatchObject({ rating: { movieId: 550 }, favorite: { movieId: 550 } });
    const second = await request(app.getHttpServer()).post('/movie-records').set(auth()).send({ ...ratingBody, movieId: 238, addToFavorites: false }).expect(201);
    expect(second.body.result.favorite).toBeNull();
    expect(await db.getRepository(Rating).count()).toBe(2);
    expect(await db.getRepository(Favorite).count()).toBe(1);
  });
  it('본인 평점 수정·공개 조회·삭제가 문서의 응답 형태와 일치한다', async () => {
    const created = await request(app.getHttpServer()).post('/ratings').set(auth()).send(ratingBody).expect(201);
    const path = `/ratings/${created.body.result.ratingId}`;
    await request(app.getHttpServer()).patch(path).set(auth()).send({ score: 4, comment: null }).expect(200);
    const list = await request(app.getHttpServer()).get(`/members/${memberId}/ratings`).expect(200);
    expect(list.body.result).toEqual([expect.objectContaining({ score: 4, comment: null })]);
    const page = await request(app.getHttpServer()).get(`/members/${memberId}/ratings?page=0&size=10`).expect(200);
    expect(page.body.result).toMatchObject({ page: 0, size: 10, totalElements: 1 });
    const deleted = await request(app.getHttpServer()).delete(path).set(auth()).expect(200);
    expect(deleted.body.result).toBeNull();
    expect(await db.getRepository(Rating).count()).toBe(0);
  });
  it('위조 토큰은 401 / AUTH401_3이고 잘못된 점수·회원 ID 주입은 400 / COMMON400이다', async () => {
    const badToken = await request(app.getHttpServer()).post('/ratings').auth('invalid', { type: 'bearer' }).send(ratingBody).expect(401);
    expect(badToken.body.code).toBe('AUTH401_3');
    for (const body of [{ ...ratingBody, score: 6 }, { ...ratingBody, memberId: 2 }]) {
      const res = await request(app.getHttpServer()).post('/ratings').set(auth()).send(body).expect(400);
      expect(res.body.code).toBe('COMMON400');
    }
  });
  it('내 정보·즐겨찾기 목록·해제 API는 본인 정보를 반환하고 정상적으로 수정·삭제한다', async () => {
    await request(app.getHttpServer()).get('/members/me').expect(401);
    const me = await request(app.getHttpServer()).get('/members/me').set(auth()).expect(200);
    expect(me.body.result.email).toBe('study@example.com');
    expect(me.body.result.password).toBeUndefined();
    await request(app.getHttpServer()).patch('/members/me').set(auth()).send({ nickname: '회고도미닉' }).expect(200);
    await request(app.getHttpServer()).post('/favorites').set(auth()).send({ movieId: 550 }).expect(201);
    const list = await request(app.getHttpServer()).get('/favorites').set(auth()).expect(200);
    expect(list.body.result).toHaveLength(1);
    await request(app.getHttpServer()).delete('/favorites/550').set(auth()).expect(200);
    const missing = await request(app.getHttpServer()).delete('/favorites/550').set(auth()).expect(404);
    expect(missing.body.code).toBe('FAVORITE404_1');
  });
  it('Swagger의 모든 API에 설명·인증 여부·상태별 code 예제가 있고 요청 DTO가 문서화된다', () => {
    const doc = createApiDocument(app);
    const publicPaths = ['/members', '/auth/login', '/members/nickname/{nickname}', '/members/email/{email}', '/members/{memberId}/ratings'];
    let count = 0;
    for (const [path, methods] of Object.entries(doc.paths)) {
      for (const method of ['get', 'post', 'patch', 'delete'] as const) {
        const operation = methods?.[method];
        if (!operation) continue;
        count++;
        expect(operation.summary).toBeTruthy();
        expect(operation.description).toBeTruthy();
        expect(operation.security ?? doc.security).toEqual(publicPaths.includes(path) ? [] : [{ bearer: [] }]);
        for (const [status, response] of Object.entries(operation.responses)) {
          if (!response || !('content' in response)) throw new Error(`${path} ${status}: missing response example`);
          const json = response.content?.['application/json'];
          const examples = json?.examples ?? { default: { value: json?.example } };
          for (const example of Object.values(examples)) {
            if (!('value' in example)) throw new Error('missing example value');
            expect(example.value.code).toMatch(/^(COMMON|AUTH|MEMBER|RATING|FAVORITE)\d/);
          }
        }
      }
    }
    expect(count).toBe(15);
    expect(doc.components?.schemas?.CreateRatingDto).toMatchObject({ required: ['movieId', 'score'] });
    expect(doc.components?.schemas?.UpdateMemberDto).toMatchObject({ required: ['nickname'] });
  });
});
