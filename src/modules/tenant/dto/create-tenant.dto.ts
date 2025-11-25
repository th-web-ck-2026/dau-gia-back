import { OmitType } from '@nestjs/swagger';
import { Tenant } from '../entities/tenant.entity';

export class CreateTenantChoThueDto extends OmitType(Tenant, ['_id']) {}
