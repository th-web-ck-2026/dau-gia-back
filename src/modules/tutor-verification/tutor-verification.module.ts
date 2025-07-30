import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TutorVerificationModel } from './models/tutor-verification.model';
import { TutorVerificationController } from './controllers/tutor-verification.controller';
import { TutorVerificationService } from './services/tutor-verification.service';
import { TutorVerificationRepository } from './repositories/tutor-verification.repository';
import { UsersModule } from '../user/user.module';
import { TutorVerificationAdminController } from './controllers/tutor-verification.admin.controller';

@Module({
  imports: [SequelizeModule.forFeature([TutorVerificationModel]), UsersModule],
  controllers: [
    TutorVerificationController,
    TutorVerificationAdminController,
  ],
  providers: [TutorVerificationService, TutorVerificationRepository],
  exports: [TutorVerificationService, TutorVerificationRepository],
})
export class TutorVerificationModule {}
