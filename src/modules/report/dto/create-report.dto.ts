import { OmitType } from '@nestjs/swagger';
import { Report as ReportEntity } from '../entities/report.entity';

export class CreateReportDto extends OmitType(ReportEntity, [
  '_id',
  'admin_note',
  'status',
]) {}
