import { Injectable } from '@nestjs/common';
import { HoaDonChoThueService } from '../hoa-don/services/hoa-don.cho-thue.service';
import { HoaDonTrangThai } from '../hoa-don/common/constant';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HoaDonNotificationService } from '../hoa-don/services/hoa-don.notification.service';

@Injectable()
export class HoaDonCronJobService {
  constructor(
    private readonly hoaDonChoThueService: HoaDonChoThueService,
    private readonly hoaDonNotificationService: HoaDonNotificationService,
  ) {}
  @Cron(CronExpression.EVERY_12_HOURS)
  async checkHanThanhToan() {
    const today = new Date();
    const twoDaysFromNow = new Date(today.setDate(today.getDate() + 2));
    const hoaDonChoThue = await this.hoaDonChoThueService.getMany({
      where: {
        trangThai: HoaDonTrangThai.CHO_THANH_TOAN,
      },
      attributes: [
        '_id',
        'hanThanhToan',
        'maHoaDon',
        'khachHangUserId',
        'userId',
        'tongTien',
        'hopDongThueId',
      ],
    });
    for (const hoaDon of hoaDonChoThue) {
      if (hoaDon.hanThanhToan && hoaDon.hanThanhToan < twoDaysFromNow) {
        this.hoaDonNotificationService.nhacNhoThanhToanHoaDon(hoaDon);
      } else if (hoaDon.hanThanhToan && hoaDon.hanThanhToan < today) {
        this.hoaDonNotificationService.hoaDonQuaHanThanhToan(hoaDon);
      }
    }
    await this.hoaDonChoThueService.updateMany(
      {
        trangThai: HoaDonTrangThai.QUA_HAN,
        trangThaiQuaHan: true,
      },
      {
        where: {
          trangThai: HoaDonTrangThai.CHO_THANH_TOAN,
          hanThanhToan: {
            [Op.lt]: today,
          },
        },
      },
    );
  }
}
