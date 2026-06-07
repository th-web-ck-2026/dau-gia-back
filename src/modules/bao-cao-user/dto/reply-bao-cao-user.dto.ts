import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyBaoCaoUserDto {
  @IsString()
  @IsNotEmpty()
  phanHoiAdmin: string;
}
