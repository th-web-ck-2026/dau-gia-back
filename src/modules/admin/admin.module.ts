import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { UsersModule } from '../user/user.module';
import { ClassModule } from '../class/class.module';
import { BidModule } from '../bid/bid.module';
import { ProfileModule } from '../profile/profile.module';
import { AdminAiService } from './services/admin-ai.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ReviewModule } from '../review/review.module';
import { AdminFlowService } from './services/admin-flow.service';
import { AdminFlowController } from './controllers/admin-flow.controller';

@Module({
  imports: [
    UsersModule,
    ClassModule,
    BidModule,
    ProfileModule,
    AuthModule,
    EnrollmentModule,
    ReviewModule,
    ConfigModule,
  ],
  controllers: [AdminController, AdminFlowController],
  providers: [AdminService, AdminAiService, AdminFlowService],
  exports: [AdminService, AdminFlowService],
})
export class AdminModule {}
