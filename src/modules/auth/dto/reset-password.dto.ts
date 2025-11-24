import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResetPassworDto {

  @IsString()
  oldPassword: string;
  @IsString()
  newPassword: string;
  
  @IsString()
  @IsOptional()
  token?: string;
}
