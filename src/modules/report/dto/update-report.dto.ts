import { PartialType } from '@nestjs/swagger';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiProperty({ description: 'Status of the report (e.g., pending, resolved, rejected)', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
