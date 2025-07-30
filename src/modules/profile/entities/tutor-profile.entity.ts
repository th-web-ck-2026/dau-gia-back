import { StrObjectId } from '@/common/constants/base.constant';
import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { IsArray, ArrayMaxSize, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { EducationLever, ExperienceYear } from '../common/constant';
import { User } from '@/modules/user/entities/user.entity';

export class TutorProfile implements BaseEntity {
  @StrObjectId()
  _id: string;

  @IsString()
  user_id: string;

  user?: User;
  
  @IsEnum(EducationLever)
  education_lever?: EducationLever;

  @IsString()
  major?: string;

  @IsEnum(ExperienceYear)
  experience_year?: ExperienceYear;

  @IsOptional()
  certificate?: string[];

  @IsString()
  intro?: string;

  @IsString()
  teaching_subject?: string[];

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  achievements?: string[];
}
