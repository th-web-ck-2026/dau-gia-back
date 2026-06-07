import { Controller, Get } from '@nestjs/common';
import { ThongKeService } from '../services/thong-ke.service';
import { Auth } from '@Decorators/auth.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ThongKe')
@Auth()
@Controller('thong-ke')
export class ThongKeController {
  constructor(private readonly thongKeService: ThongKeService) {}

  @ApiOperation({ summary: 'Admin lấy thống kê hệ thống' })
  @Roles(UserRoles.ADMIN)
  @Get('admin/stats')
  async getDashboardStats() {
    return this.thongKeService.getDashboardStats();
  }
}
