import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'ID of the user who created the report' })
  @IsNotEmpty()
  @IsString()
  reporterId: string;

  @ApiProperty({ description: 'ID of the user being reported' })
  @IsNotEmpty()
  @IsString()
  reportedUserId: string;

  @ApiProperty({ description: 'ID of the class related to the report (optional)', required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ description: 'Reason for the report' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
