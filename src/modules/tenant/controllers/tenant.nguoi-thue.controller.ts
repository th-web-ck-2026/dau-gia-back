import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from '@Decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { TenantNguoiThueService } from '../services/tenant.nguoi-thue.service';
import { ApiTags } from '@nestjs/swagger';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { PhanHoiYeuCauChoThueDto } from '../dto/phan-hoi-tenant.dto';
@Auth(UserRoles.USER)
@Controller('tenant/nguoi-thue')
@ApiTags('Tenant Nguoi Thue')
export class TenantNguoiThueController {
  constructor(
    private readonly tenantNguoiThueService: TenantNguoiThueService,
  ) {}

  @Get('me/page')
  async getPageYeuCauChoThueMe(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.tenantNguoiThueService.getPageYeuCauChoThueMe(user, query);
  }
  @Get('me/:id')
  async getYeuCauChoThueMeById(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.tenantNguoiThueService.getYeuCauChoThueMeById(user, id);
  }
  @Post('me/:id/phan-hoi')
  async phanHoiYeuCauChoThueMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() phanHoiYeuCauChoThueDto: PhanHoiYeuCauChoThueDto,
  ) {
    return this.tenantNguoiThueService.phanHoiYeuCauChoThue(
      user,
      id,
      phanHoiYeuCauChoThueDto.trangThai,
    );
  }
}
