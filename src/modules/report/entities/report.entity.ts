import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { ReportReason, ReportStatus } from '../common/constant';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class Report implements BaseEntity {
  @StrObjectId()
  _id: string;

  @IsString()
  reporterId: string;

  @IsString()
  reportedUserId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;
  
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  admin_note?: string;

  @IsEnum(ReportStatus)
  status: ReportStatus;
}
