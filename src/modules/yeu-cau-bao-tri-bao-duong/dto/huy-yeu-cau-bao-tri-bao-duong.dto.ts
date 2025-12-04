import { IsString } from 'class-validator';

export class HuyYeuCauBaoTriBaoDuongDto {
  @IsString()
  lyDoHuy: string;
}
