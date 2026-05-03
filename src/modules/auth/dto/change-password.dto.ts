import { IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsOptional()
  @IsBoolean()
  logoutOtherDevices?: boolean;
}
