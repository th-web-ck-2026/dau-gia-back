import { PickType } from '@nestjs/swagger';
import { Report } from '../entities/report.entity';

export class UpdateReportDto extends PickType(Report, [
  'admin_note',
  'status',
]) {}
