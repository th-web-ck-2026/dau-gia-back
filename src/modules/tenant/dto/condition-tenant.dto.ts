import { PartialType } from '@nestjs/mapped-types';
import { Tenant } from '../entities/tenant.entity';

export class ConditionTenantDto extends PartialType(Tenant) {}
