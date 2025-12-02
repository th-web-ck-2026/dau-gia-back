import { PartialType } from '@nestjs/swagger';
import { HopDongThue } from '../entities/hop-dong-thue.entity';

export class ConditionHopDongThueDto extends PartialType(HopDongThue) {}
