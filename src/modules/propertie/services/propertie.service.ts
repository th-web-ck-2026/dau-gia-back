import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Propertie } from '../entities/propertie.entity';
import { PropertieRepository } from '../repositories/propertie.repository';
import { CreatePropertieDto } from '../dto/create-propertie.dto';
import { UpdatePropertieDto } from '../dto/update-propertie.dto';

@Injectable()
export class PropertieService extends BaseService<Propertie> {
  constructor(private readonly propertieRepository: PropertieRepository) {
    super(propertieRepository);
  }

}
