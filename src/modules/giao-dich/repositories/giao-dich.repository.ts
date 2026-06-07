import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { GiaoDich } from '../entities/giao-dich.entity';
import { GiaoDichModel } from '../models/giao-dich.model';

@Injectable()
export class GiaoDichRepository extends BaseRepository<GiaoDich> {
  constructor() {
    super(GiaoDichModel);
  }
}
