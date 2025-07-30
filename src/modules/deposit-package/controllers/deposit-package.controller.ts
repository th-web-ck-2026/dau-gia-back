import { 
  Controller,
  Get, 
} from '@nestjs/common';
import { DepositPackageService } from '../services/deposit-package.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';

@Public()
@Controller('deposit-package')
export class DepositPackageController {
  constructor(private readonly depositPackageService: DepositPackageService) {}
  
  @ApiOperation({ summary: 'Lấy danh sách gói nạp ví' })
  @Get()
  async getDepositPackages() {
    return this.depositPackageService.getMany({});
  }
}
