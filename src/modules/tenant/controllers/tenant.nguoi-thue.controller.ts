import { Controller } from '@nestjs/common';
import { Auth } from '@Decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { TenantNguoiThueService } from '../services/tenant.nguoi-thue.service';
@Auth(UserRoles.USER)
@Controller('tenant/nguoi-thue')
export class TenantNguoiThueController {
  constructor(private readonly tenantNguoiThueService: TenantNguoiThueService) {}
}
