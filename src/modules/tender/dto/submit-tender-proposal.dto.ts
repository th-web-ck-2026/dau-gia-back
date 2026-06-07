import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmissionValueDto {
  @IsString()
  @IsNotEmpty()
  tieuChiId: string;

  @IsNotEmpty()
  giaTriGoc: any;
}

export class SubmitTenderProposalDto {
  @IsString()
  @IsOptional()
  phienId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionValueDto)
  giaTriTieuChi: SubmissionValueDto[];
}
