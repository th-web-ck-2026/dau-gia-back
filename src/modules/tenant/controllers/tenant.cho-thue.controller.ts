import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
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
import { ApiTags } from '@nestjs/swagger';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
@Auth(UserRoles.USER)
@Controller('tenant/cho-thue')
@ApiTags('Tenant Cho Thue')
export class TenantChoThueController {
  constructor(private readonly tenantChoThueService: TenantChoThueService) {}

  @Get('me/page')
  async getDanhSachNguoiThuePage(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.tenantChoThueService.getDanhSachNguoiThuePage(user, query);
  }
}
