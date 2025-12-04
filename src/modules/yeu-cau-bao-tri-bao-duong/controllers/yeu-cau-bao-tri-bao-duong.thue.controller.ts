import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { YeuCauBaoTriBaoDuongThueService } from '../services/yeu-cau-bao-tri-bao-duong.thue.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ReqUser } from '@/common/decorators/user.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionYeuCauBaoTriBaoDuongDto } from '../dto/condition-yeu-cau-bao-tri-bao-duong.dto';
import { CreateYeuCauBaoTriBaoDuongDto } from '../dto/create-yeu-cau-bao-tri-bao-duong.dto';
import { UserRoles } from '@/modules/user/common/constant';
import { Auth } from '@/common/decorators/auth.decorator';
@Auth(UserRoles.USER)
@Controller('yeu-cau-bao-tri-bao-duong/nguoi-thue')
@ApiTags('Yeu Cau Bao Tri Bao Duong Nguoi Thue')
export class YeuCauBaoTriBaoDuongNguoiThueController {
  constructor(
    private readonly yeuCauBaoTriBaoDuongThueService: YeuCauBaoTriBaoDuongThueService,
  ) {}
  @Get('me/page')
  async getMePage(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.yeuCauBaoTriBaoDuongThueService.getMePage(user, query);
  }
  @Get('me/:id')
  async getMeById(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.yeuCauBaoTriBaoDuongThueService.getMeById(user, id);
  }
  @Post('me')
  async createYeuCauBaoTriBaoDuong(
    @ReqUser() user: AuthUser,
    @Body() createYeuCauBaoTriBaoDuongDto: CreateYeuCauBaoTriBaoDuongDto,
  ) {
    return this.yeuCauBaoTriBaoDuongThueService.createYeuCauBaoTriBaoDuongThue(
      user,
      createYeuCauBaoTriBaoDuongDto,
    );
  }
}
