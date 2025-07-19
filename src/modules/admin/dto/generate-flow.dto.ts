import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateFlowDto {
  @ApiProperty({
    description: 'The quantity to generate (1 tutor and 2 students per quantity unit)',
    example: 1,
  })
  @IsNumber()
  quantity: number;
}
