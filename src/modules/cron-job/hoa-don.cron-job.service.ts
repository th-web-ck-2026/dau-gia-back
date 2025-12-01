import { Injectable } from '@nestjs/common';
import { HoaDonChoThueService } from '../hoa-don/services/hoa-don.cho-thue.service';
import { HoaDonTrangThai } from '../hoa-don/common/constant';
import { Op } from 'sequelize';

@Injectable()
export class HoaDonCronJobService {
  constructor(private readonly hoaDonChoThueService: HoaDonChoThueService) {}
  async checkHanThanhToan() {
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    const hoaDonChoThue = await this.hoaDonChoThueService.getMany({
      where: {
        trangThai: HoaDonTrangThai.CHO_THANH_TOAN,
        hanThanhToan: {
          [Op.lt]: tomorrow,
        },
      },
    });
    await this.hoaDonChoThueService.updateMany(
      {
        trangThai: HoaDonTrangThai.QUA_HAN,
        trangThaiQuaHan: true,
      },
      {
        where: { _id: { [Op.in]: hoaDonChoThue.map((item) => item._id) } },
      },
    );
  }
}
