import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageableDto } from '@Common/dto/pageable.dto';

export class ConditionReportDto extends PageableDto {
  @ApiProperty({ description: 'Filter by reporter ID', required: false })
  @IsOptional()
  @IsString()
  reporterId?: string;

  @ApiProperty({ description: 'Filter by reported user ID', required: false })
  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @ApiProperty({ description: 'Filter by class ID', required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ description: 'Filter by report status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
