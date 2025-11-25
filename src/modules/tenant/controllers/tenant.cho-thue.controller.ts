import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { TenantChoThueService } from '../services/tenant.cho-thue.service';
import { CreateYeuCauChoThueDto } from '../dto/create-yeu-cau.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';
import { UserRoles } from '@/modules/user/common/constant';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
@Auth(UserRoles.USER)
@Controller('tenant/cho-thue')
export class TenantChoThueController {
  constructor(private readonly tenantChoThueService: TenantChoThueService) {}

  @Post('yeu-cau-cho-thue')
  async createYeuCauChoThue(
    @ReqUser() user: AuthUser,
    @Body() createYeuCauChoThueDto: CreateYeuCauChoThueDto,
  ) {
    return this.tenantChoThueService.createYeuCauChoThue(
      user,
      createYeuCauChoThueDto,
    );
  }
}
