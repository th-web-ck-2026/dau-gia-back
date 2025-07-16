import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewModel } from './models/review.model';
import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { ReviewRepository } from './repositories/review.repository';
import { ClassModule } from '../class/class.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UsersModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ReviewModel]),
    EnrollmentModule,
    forwardRef(() =>UsersModule),
    NotificationModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
