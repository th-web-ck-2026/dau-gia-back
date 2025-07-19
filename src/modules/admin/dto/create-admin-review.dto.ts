import { IsString, IsNumber, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateAdminReviewDto {
  @IsNotEmpty()
  @IsString()
  classId: string;

  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}
