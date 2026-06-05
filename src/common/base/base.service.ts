import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { BaseEntity } from '../interfaces/base-entity.interface';
import { DestroyOptions, FindOptions, UpdateOptions } from 'sequelize';
import { QueryOption } from '../pipe/query-option.interface';
import { PageableDto } from '../dto/pageable.dto';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async getMany(condition?: FindOptions): Promise<T[]> {
    return this.repository.getMany(condition);
  }

  async getOne(condition: FindOptions): Promise<T | null> {
    return this.repository.getOne(condition);
  }
  async getPage(
    condition?: FindOptions,
    options?: QueryOption,
  ): Promise<PageableDto<T>> {
    return this.repository.getPage(condition, options);
  }
  async getById(id: string): Promise<T | null> {
    return this.repository.getById(id);
  }

  async create(createDto: any): Promise<T> {
    return this.repository.create(createDto);
  }

  async updateOne(
    updateDto: any,
    condition?: UpdateOptions,
  ): Promise<T | null> {
    await this.repository.updateOne(updateDto, condition);
    return this.repository.getOne(condition);
  }
  async updateMany(
    updateDto: any,
    condition?: UpdateOptions,
  ): Promise<{ n: number }> {
    return this.repository.updateMany(updateDto, condition);
  }
  async updateAtomic(
    updateDto: any,
    condition?: UpdateOptions,
  ): Promise<number> {
    return this.repository.updateAtomic(updateDto, condition);
  }

  async deleteOne(condition: DestroyOptions): Promise<T | null> {
    return this.repository.deleteOne(condition);
  }
  async count(condition?: any): Promise<number> {
    return this.repository.count(condition);
  }
}
