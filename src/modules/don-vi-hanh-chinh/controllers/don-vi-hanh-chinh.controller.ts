import { Controller, Get, Param } from '@nestjs/common';
import { DonViHanhChinhService } from '../services/don-vi-hanh-chinh.service';
import { Public } from '@Decorators/public.decorator';

@Controller('don-vi-hanh-chinh')
export class DonViHanhChinhController {
  constructor(private readonly donViHanhChinhService: DonViHanhChinhService) {}
  @Public()
  @Get('tinh-thanh')
  async getTinhThanh() {
    return this.donViHanhChinhService.getMany({ where: { level: 1 } });
  }
  @Public()
  @Get('tinh-thanh/:code/phuong-xa')
  async getPhuongXa(@Param('code') code: string) {
    return this.donViHanhChinhService.getMany({
      where: { provinceCode: code, level: 2 },
    });
  }
}
