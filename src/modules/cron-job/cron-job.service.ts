import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenderService } from '@/modules/tender/services/tender.service';
import { AuctionService } from '@/modules/auction/services/auction.service';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { Op } from 'sequelize';
import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';
import { TrangThaiGiaoDich, LyDoThatBai } from '@/modules/giao-dich/common/constants';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly tenderService: TenderService,
    private readonly auctionService: AuctionService,
    private readonly giaoDichService: GiaoDichService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running auto open/close session cron job...');

    // 1. Process Tender Sessions
    try {
      const activeTenders = await this.tenderService.getMany({
        where: {
          trangThai: {
            [Op.in]: [TrangThaiPhien.CONG_BO, TrangThaiPhien.MO],
          },
        },
      });

      for (const session of activeTenders) {
        try {
          await this.tenderService.checkAndTransitionStateInternal(session);
        } catch (sessionError) {
          this.logger.error(
            `Error processing tender session ${session._id}:`,
            sessionError,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error fetching active tender sessions:', error);
    }

    // 2. Process Auction Sessions
    try {
      const activeAuctions = await this.auctionService.getMany({
        where: {
          trangThai: {
            [Op.in]: [TrangThaiPhien.CONG_BO, TrangThaiPhien.MO],
          },
        },
      });

      for (const session of activeAuctions) {
        try {
          await this.auctionService.checkAndTransitionStateInternal(session);
        } catch (sessionError) {
          this.logger.error(
            `Error processing auction session ${session._id}:`,
            sessionError,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error fetching active auction sessions:', error);
    }

    await this.xuLyGiaoDichQuaHan();
  }

  async xuLyGiaoDichQuaHan(): Promise<void> {
    try {
      const now = new Date();
      const quaHan = await this.giaoDichService.getMany({
        where: {
          trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
          hanXacNhan: { [Op.lt]: now },
        },
      });
      for (const gd of quaHan) {
        try {
          await this.giaoDichService.updateOne(
            { trangThai: TrangThaiGiaoDich.THAT_BAI, lyDoThatBai: LyDoThatBai.QUA_HAN },
            { where: { _id: gd._id } },
          );
        } catch (e) {
          this.logger.error(`Error failing giao dich ${gd._id}:`, e);
        }
      }
      if (quaHan.length > 0) {
        this.logger.log(`Marked ${quaHan.length} giao dich as THAT_BAI (qua han).`);
      }
    } catch (error) {
      this.logger.error('Error processing overdue giao dich:', error);
    }
  }

  async run() {
    this.logger.log('CronJobService initialization run');
    await this.handleCron();
  }
}
