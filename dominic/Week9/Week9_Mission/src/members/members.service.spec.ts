import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { MembersService } from './members.service';

describe('평점 서비스 단위 테스트 (가짜 Repository)', () => {
  let service: MembersService;
  const members = { findOneBy: jest.fn() };
  const ratings = { exist: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({ providers: [
      MembersService,
      { provide: getRepositoryToken(Member), useValue: members },
      { provide: getRepositoryToken(Rating), useValue: ratings },
    ] }).compile();
    service = module.get(MembersService);
  });

  it('같은 영화에 평점을 중복 등록하면 409 / RATING409_1이고 저장하지 않는다', async () => {
    // given
    members.findOneBy.mockResolvedValue({ memberId: '1' });
    ratings.exist.mockResolvedValue(true);
    // when / then
    await expect(service.createRating('1', { movieId: 550, score: 5 })).rejects.toMatchObject({ status: 409, response: { code: 'RATING409_1' } });
    expect(ratings.save).not.toHaveBeenCalled();
  });

  it('남의 평점을 수정하면 403 / RATING403_1이고 기존 평점을 저장하지 않는다', async () => {
    // given
    const existing = { ratingId: '1', member: { memberId: '2' }, score: 3 };
    ratings.findOne.mockResolvedValue(existing);
    // when / then
    await expect(service.updateRating('1', '1', { score: 5 })).rejects.toMatchObject({ status: 403, response: { code: 'RATING403_1' } });
    expect(existing.score).toBe(3);
    expect(ratings.save).not.toHaveBeenCalled();
  });
});
