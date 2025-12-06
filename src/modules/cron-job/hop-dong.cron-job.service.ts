import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HopDongThueService } from '../hop-dong-thue/services/hop-dong-thue.service';
import { HopDongTrangThai } from '../hop-dong-thue/common/constant';

@Injectable()
export class HopDongCronJobService {
  constructor(private readonly hopDongThueService: HopDongThueService) {}
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
}
