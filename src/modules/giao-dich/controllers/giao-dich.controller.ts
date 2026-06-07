import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GiaoDichService } from '../services/giao-dich.service';
import { ConditionGiaoDichDto } from '../dto/condition-giao-dich.dto';
import { DaChuyenKhoanDto } from '../dto/da-chuyen-khoan.dto';
import { GhiChuDto } from '../dto/ghi-chu.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';

@ApiTags('Giao dịch hậu đấu giá/đấu thầu')
@Auth()
@Controller('giao-dich')
export class GiaoDichController {
  constructor(private readonly giaoDichService: GiaoDichService) {}

  @ApiOperation({ summary: 'Danh sách giao dịch của tôi' })
  @Get('me')
  async getPageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionGiaoDichDto) condition: ConditionGiaoDichDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.giaoDichService.getPageMe(user.id, condition, query);
  }

  @ApiOperation({ summary: 'Chi tiết giao dịch' })
  @Get(':id')
  async getChiTiet(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.getChiTiet(user.id, id, user.role);
  }

  @ApiOperation({ summary: 'Người thắng xác nhận' })
  @Post(':id/xac-nhan')
  async xacNhan(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhan(user.id, id);
  }

  @ApiOperation({ summary: 'Người thắng từ chối' })
  @Post(':id/tu-choi')
  async tuChoi(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.tuChoi(user.id, id);
  }

  @ApiOperation({ summary: 'Cập nhật ghi chú liên hệ' })
  @Put(':id/ghi-chu')
  async capNhatGhiChu(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: GhiChuDto,
  ) {
    return this.giaoDichService.capNhatGhiChu(user.id, id, dto);
  }

  @ApiOperation({ summary: '[Đấu giá] Người thắng báo đã chuyển khoản' })
  @Post(':id/da-chuyen-khoan')
  async baoDaChuyenKhoan(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: DaChuyenKhoanDto,
  ) {
    return this.giaoDichService.baoDaChuyenKhoan(user.id, id, dto);
  }

  @ApiOperation({ summary: '[Đấu giá] Chủ phiên xác nhận nhận tiền' })
  @Post(':id/xac-nhan-tien')
  async xacNhanNhanTien(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhanNhanTien(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu giá] Chủ phiên hoàn tất' })
  @Post(':id/hoan-tat')
  async hoanTat(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.hoanTat(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Ký hợp đồng' })
  @Post(':id/ky-hop-dong')
  async kyHopDong(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.kyHopDong(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Chủ phiên bàn giao' })
  @Post(':id/ban-giao')
  async banGiao(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.banGiao(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Người thắng xác nhận nhận' })
  @Post(':id/xac-nhan-nhan')
  async xacNhanNhan(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhanNhan(user.id, id);
  }

  @ApiOperation({ summary: 'Chủ phiên hủy giao dịch' })
  @Post(':id/huy')
  async huy(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.huy(user.id, id);
  }
}
