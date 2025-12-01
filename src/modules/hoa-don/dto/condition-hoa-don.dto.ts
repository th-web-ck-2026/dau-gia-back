import { PartialType } from '@nestjs/swagger';
import { HoaDon } from '../entities/hoa-don.entity';

export class ConditionHoaDonDto extends PartialType(HoaDon) {}
