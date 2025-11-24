import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Unit } from '../entities/unit.entity';
import { UnitRepository } from '../repositories/unit.repository';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';

@Injectable()
export class UnitService extends BaseService<Unit> {
  constructor(private readonly unitRepository: UnitRepository) {
    super(unitRepository);
  }

}
