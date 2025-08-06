import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { VerifyLever, VerifyStatus } from '../common/constant';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { User } from '@/modules/user/entities/user.entity';

export class TutorVerification implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  tutor_id: string;

  tutor?: User;
  
  @IsString()
  @IsOptional()
  cccd_front?: string;
  
  @IsString()
  @IsOptional()
  cccd_back?: string;

  @IsString()
  @IsOptional()
  face?: string;
  
  @IsEnum(VerifyLever)
  verifyLever: VerifyLever;
  
  @IsEnum(VerifyStatus)
  status: VerifyStatus;
  
  @IsOptional()
  meeting_time?: string;
  
  @IsOptional()
  meeting_url?: string;
  
  @IsOptional()
  verify_at?: Date;
  
  @IsOptional()
  note?: string;
  
  @IsOptional()
  reason?: string;
}
