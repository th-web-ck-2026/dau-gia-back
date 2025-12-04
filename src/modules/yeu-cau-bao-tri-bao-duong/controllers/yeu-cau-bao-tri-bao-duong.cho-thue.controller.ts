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
import { YeuCauBaoTriBaoDuongChoThueService } from '../services/yeu-cau-bao-tri-bao-duong.cho-thue.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { ConditionYeuCauBaoTriBaoDuongDto } from '../dto/condition-yeu-cau-bao-tri-bao-duong.dto';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { HuyYeuCauBaoTriBaoDuongDto } from '../dto/huy-yeu-cau-bao-tri-bao-duong.dto';
import { UserRoles } from '@/modules/user/common/constant';
import { Auth } from '@/common/decorators/auth.decorator';
import { TiepNhanYeuCauBaoTriBaoDuongDto } from '../dto/tiep-nhan-yeu-cau-bao-tri-bao-duong.dto';

@Auth(UserRoles.USER)
@Controller('yeu-cau-bao-tri-bao-duong/cho-thue')
@ApiTags('Yeu Cau Bao Tri Bao Duong Cho Thue')
export class YeuCauBaoTriBaoDuongChoThueController {
  constructor(
    private readonly yeuCauBaoTriBaoDuongChoThueService: YeuCauBaoTriBaoDuongChoThueService,
  ) {}
  @Get('me/page')
  async getMePage(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionYeuCauBaoTriBaoDuongDto)
    condition: ConditionYeuCauBaoTriBaoDuongDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.yeuCauBaoTriBaoDuongChoThueService.getMePage(
      user,
      condition,
      query,
    );
  }
  @Get('me/:id')
  async getMeById(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.yeuCauBaoTriBaoDuongChoThueService.getMeById(user, id);
  }
  @Post('me/:id/tiep-nhan')
  async tiepNhanYeuCauBaoTriBaoDuong(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() tiepNhanYeuCauBaoTriBaoDuongDto: TiepNhanYeuCauBaoTriBaoDuongDto,
  ) {
    return this.yeuCauBaoTriBaoDuongChoThueService.tiepNhanYeuCauBaoTriBaoDuong(
      user,
      id,
      tiepNhanYeuCauBaoTriBaoDuongDto.ngayDuKienHoanThanh,
    );
  }
  @Post('me/:id/hoan-thanh')
  async hoanThanhYeuCauBaoTriBaoDuong(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.yeuCauBaoTriBaoDuongChoThueService.hoanThanhYeuCauBaoTriBaoDuong(
      user,
      id,
    );
  }
  @Post('me/:id/huy')
  async huyYeuCauBaoTriBaoDuong(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() huyYeuCauBaoTriBaoDuongDto: HuyYeuCauBaoTriBaoDuongDto,
  ) {
    return this.yeuCauBaoTriBaoDuongChoThueService.huyYeuCauBaoTriBaoDuong(
      user,
      id,
      huyYeuCauBaoTriBaoDuongDto.lyDoHuy,
    );
  }
}
