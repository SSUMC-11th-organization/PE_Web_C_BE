import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookRepository } from './book.repository';
import { bodyId } from '../common/input';

@Injectable()
export class BookService {
  constructor(private readonly repository: BookRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findByCategory(categoryId: number) {
    if (!(await this.repository.categoryExists(categoryId))) {
      throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
    }
    return this.repository.findByCategory(categoryId);
  }

  // DTO 없이 원래 JSON 객체를 받아 최소한의 입력 검사를 수행합니다.
  async create(body: Record<string, unknown>) {
    const categoryId = bodyId(body, 'categoryId');
    const title = body?.title;
    const description = body?.description ?? null;
    if (typeof title !== 'string' || title.trim().length === 0 || Array.from(title).length > 100) {
      throw new BadRequestException('title은 비어 있지 않은 100자 이하 문자열이어야 합니다.');
    }
    if (description !== null && typeof description !== 'string') {
      throw new BadRequestException('description은 문자열 또는 null이어야 합니다.');
    }
    if (typeof description === 'string' && Buffer.byteLength(description, 'utf8') > 65535) {
      throw new BadRequestException('description이 TEXT 컬럼의 최대 길이를 초과했습니다.');
    }
    if (!(await this.repository.categoryExists(categoryId))) {
      throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
    }
    return this.repository.create(categoryId, title, description);
  }
}
