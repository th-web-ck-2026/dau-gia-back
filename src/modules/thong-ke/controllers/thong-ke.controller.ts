import { Controller, Get, Param } from '@nestjs/common';
import { ThongKeService } from '../services/thong-ke.service';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';

@Auth(UserRoles.USER)
@Controller('thong-ke')
export class ThongKeController {
  constructor(private readonly thongKeService: ThongKeService) {}
  @Get('don-vi-thue/:thangBatDau/:thangKetThuc')
  async thongKeTapDongTheoNgay(
    @ReqUser() user: AuthUser,
    @Param('thangBatDau') thangBatDau: Date,
    @Param('thangKetThuc') thangKetThuc: Date,
  ) {
    return this.thongKeService.thongKeTapDongTheoNgay(
      user,
      thangBatDau,
      thangKetThuc,
    );
  }

  @Get('doanh-thu-tai-san/:thangBatDau/:thangKetThuc')
  async thongKeDoanhThuTaiSanTheoThang(
    @ReqUser() user: AuthUser,
    @Param('thangBatDau') thangBatDau: Date,
    @Param('thangKetThuc') thangKetThuc: Date,
  ) {
    return this.thongKeService.thongKeDoanhThuTaiSanTheoThang(
      user,
      thangBatDau,
      thangKetThuc,
    );
  }
  @Get('doanh-thu-tai-san/:thangBatDau/:thangKetThuc/:taiSanId')
  async thongKeDoanhThuTaiSanById(
    @ReqUser() user: AuthUser,
    @Param('taiSanId') taiSanId: string,
    @Param('thangBatDau') thangBatDau: Date,
    @Param('thangKetThuc') thangKetThuc: Date,
  ) {
    return this.thongKeService.thongKeDoanhThuTaiSanById(
      user,
      taiSanId,
      thangBatDau,
      thangKetThuc,
    );
  }
  @Get('don-vi-thue/:thangBatDau/:thangKetThuc/:taiSanId')
  async thongKeDonViTheoTaiSanId(
    @ReqUser() user: AuthUser,
    @Param('taiSanId') taiSanId: string,
    @Param('thangBatDau') thangBatDau: Date,
    @Param('thangKetThuc') thangKetThuc: Date,
  ) {
    return this.thongKeService.thongKeDonViTheoTaiSanId(
      user,
      taiSanId,
      thangBatDau,
      thangKetThuc,
    );
  }
}
