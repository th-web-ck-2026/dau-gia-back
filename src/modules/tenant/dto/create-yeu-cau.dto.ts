import { OmitType, PickType } from '@nestjs/swagger';
import { Tenant } from '../entities/tenant.entity';

export class CreateYeuCauChoThueDto extends PickType(Tenant, [
  'hopDongThueId',
  'khachHangUserId',
]) {}
