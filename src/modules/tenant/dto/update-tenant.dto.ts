import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantChoThueDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantChoThueDto) {}
