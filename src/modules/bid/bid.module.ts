import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BidModel } from './models/bid.model';
import { BidController } from './controllers/bid.controller';
import { BidService } from './services/bid.service';
import { BidRepository } from './repositories/bid.repository';

import { ClassModule } from '../class/class.module';
import { UsersModule } from '../user/user.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { NotificationModule } from '../notification/notification.module';
import { SendMailModule } from '../send-mail/send-mail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([BidModel]),
    forwardRef(() => ClassModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationModule),
    SendMailModule,
  ],
  controllers: [BidController],
  providers: [BidService, BidRepository],
  exports: [BidService, BidRepository],
})
export class BidModule {}
