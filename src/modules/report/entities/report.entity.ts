import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { Column } from 'sequelize-typescript';
import { ReportStatus } from '../common/constant';
import { IsEnum, IsString } from 'class-validator';

export class Report implements BaseEntity {
  @StrObjectId()
  _id: string;


  reporterId: string;


  reportedUserId: string;


  classId?: string;

  @IsString()
  reason: string;

  @IsEnum(ReportStatus)
  status: ReportStatus;
}
