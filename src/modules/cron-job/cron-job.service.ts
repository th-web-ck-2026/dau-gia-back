import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenderService } from '@/modules/tender/services/tender.service';
import { AuctionService } from '@/modules/auction/services/auction.service';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { Op } from 'sequelize';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly tenderService: TenderService,
    private readonly auctionService: AuctionService,
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
  }

  async run() {
    this.logger.log('CronJobService initialization run');
    await this.handleCron();
  }
}
