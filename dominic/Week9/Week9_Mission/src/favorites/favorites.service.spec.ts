import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Member } from '../entities/member.entity';
import { FavoritesService } from './favorites.service';

describe('즐겨찾기 서비스 단위 테스트 (가짜 Repository)', () => {
  let service: FavoritesService;
  const favorites = { exists: jest.fn(), create: jest.fn(), save: jest.fn() };
  const members = { findOneBy: jest.fn() };
  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({ providers: [
      FavoritesService,
      { provide: getRepositoryToken(Favorite), useValue: favorites },
      { provide: getRepositoryToken(Member), useValue: members },
    ] }).compile();
    service = module.get(FavoritesService);
    members.findOneBy.mockResolvedValue({ memberId: '1' });
    favorites.create.mockImplementation(value => value);
    favorites.save.mockResolvedValue({ favoriteId: '1', movieId: '550', createdAt: new Date() });
  });

  it('아직 즐겨찾기하지 않은 영화면 1회 저장하고 movieId를 반환한다', async () => {
    // given
    favorites.exists.mockResolvedValue(false);
    // when
    const result = await service.create('1', 550);
    // then
    expect(result.movieId).toBe(550);
    expect(favorites.save).toHaveBeenCalledTimes(1);
  });

  it('이미 즐겨찾기한 영화면 409 / FAVORITE409_1이고 저장을 시도하지 않는다', async () => {
    // given
    favorites.exists.mockResolvedValue(true);
    // when / then
    await expect(service.create('1', 550)).rejects.toMatchObject({ status: 409, response: { code: 'FAVORITE409_1' } });
    expect(favorites.save).not.toHaveBeenCalled();
  });
});
