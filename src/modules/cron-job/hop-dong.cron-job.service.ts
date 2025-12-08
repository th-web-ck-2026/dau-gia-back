import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HopDongThueService } from '../hop-dong-thue/services/hop-dong-thue.service';
import {
  HopDongTrangThai,
  KyThanhToanTrangThai,
} from '../hop-dong-thue/common/constant';
import { KyThanhToanRepository } from '../hop-dong-thue/repositories/ky-thanh-toan.repository';
import { HoaDonNotificationService } from '../hoa-don/services/hoa-don.notification.service';
import { HopDongThueModel } from '../hop-dong-thue/models/hop-dong-thue.model';

@Injectable()
export class HopDongCronJobService {
  constructor(
    private readonly hopDongThueService: HopDongThueService,
    private readonly kyThanhToanRepository: KyThanhToanRepository,
    private readonly hoaDonNotificationService: HoaDonNotificationService,
  ) {}
  @Cron(CronExpression.EVERY_12_HOURS)
  async checkHopDongThue() {
    const today = new Date();
    await this.hopDongThueService.updateMany(
      {
        trangThai: HopDongTrangThai.CHO_HOAN_THANH,
      },
      {
        where: {
          trangThai: HopDongTrangThai.DANG_THUE,
          ngayKetThucThue: {
            [Op.lt]: today,
          },
        },
      },
    );
  }
  @Cron(CronExpression.EVERY_12_HOURS)
  async checkKyThanhToan() {
    const today = new Date();
    const kyThanhToans = await this.kyThanhToanRepository.getMany({
      where: {
        trangThai: KyThanhToanTrangThai.CHUA_BAT_DAU,
        ngayBatDauThanhToan: {
          [Op.lte]: today,
        },
      },
      include: [
        {
          model: HopDongThueModel,
        },
      ],
    });
    await this.kyThanhToanRepository.updateMany(
      {
        trangThai: KyThanhToanTrangThai.CHO_TAO_HOA_DON,
      },
      {
        where: { _id: kyThanhToans.map((ky) => ky._id) },
      },
    );
    for (const kyThanhToan of kyThanhToans) {
      if (kyThanhToan.hopDongThue) {
        this.hoaDonNotificationService.nhacNhoCanTaoHoaDonChoKyThanhToan(
          kyThanhToan,
        );
      }
    }
  }
}
