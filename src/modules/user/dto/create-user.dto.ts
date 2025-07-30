import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  role?: string;
}
