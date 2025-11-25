import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { Tenant } from '../entities/tenant.entity';
import { TenantModel } from '../models/tenant.model';
@Injectable()
export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(TenantModel);
  }

}
