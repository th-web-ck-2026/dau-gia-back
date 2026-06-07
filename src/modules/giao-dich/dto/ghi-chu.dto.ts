import { IsNotEmpty, IsString } from 'class-validator';

export class GhiChuDto {
  @IsString()
  @IsNotEmpty()
  ghiChu: string;
}
