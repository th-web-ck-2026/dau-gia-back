import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionHoaDonDto } from '../dto/condition-hoa-don.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { HoaDonNguoiThueService } from '../services/hoa-don.nguoi-thue.service';
import { Auth } from '@Decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';

@Auth(UserRoles.USER)
@Controller('hoa-don/nguoi-thue')
@ApiTags('Hoa Don Nguoi Thue')
export class HoaDonNguoiThueController {
  constructor(
    private readonly hoaDonNguoiThueService: HoaDonNguoiThueService,
  ) {}
  @Get('me/page')
  async getHoaDonNguoiThuePageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionHoaDonDto) condition: ConditionHoaDonDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.hoaDonNguoiThueService.getHoaDonNguoiThuePageMe(
      user,
      condition,
      query,
    );
  }
  @Get('me/:id')
  async getHoaDonChoThueByIdMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.hoaDonNguoiThueService.getOne({
      where: { _id: id, khachHangUserId: user.id },
      include: [
        {
          model: HopDongThueModel,
        },
      ],
    });
  }
  @Put('me/:id/thanh-toan')
  async thanhToanHoaDonNguoiThueMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.hoaDonNguoiThueService.xacNhanThanhToanHoaDonNguoiThue(
      user,
      id,
    );
  }
  @Post('me/:id/xac-nhan-noi-dung')
  async xacNhanNoiDungHoaDonNguoiThueMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.hoaDonNguoiThueService.nguoiThueXacNhanNoiDungHoaDon(user, id);
  }
}
