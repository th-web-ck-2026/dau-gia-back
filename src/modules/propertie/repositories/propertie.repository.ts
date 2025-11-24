import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { Propertie } from '../entities/propertie.entity';
import { PropertieModel } from '../models/propertie.model';
@Injectable()
export class PropertieRepository extends BaseRepository<Propertie> {
  constructor() {
    super(PropertieModel);
  }

}
