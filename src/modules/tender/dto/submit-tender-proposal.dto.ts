import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
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
  @IsNotEmpty()
  phienId: string;

  @IsNumber()
  @IsNotEmpty()
  giaDeXuat: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionValueDto)
  giaTriTieuChi: SubmissionValueDto[];
}
