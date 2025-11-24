import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { Unit } from '../entities/unit.entity';
import { UnitModel } from '../models/unit.model';
@Injectable()
export class UnitRepository extends BaseRepository<Unit> {
  constructor() {
    super(UnitModel);
  }

}
