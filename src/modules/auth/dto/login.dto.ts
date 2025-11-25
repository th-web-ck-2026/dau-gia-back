import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ValidateIf((o) => !o.refreshToken)
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ValidateIf((o) => !o.refreshToken)
  @IsNotEmpty()
  @MinLength(8)
  password?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}
