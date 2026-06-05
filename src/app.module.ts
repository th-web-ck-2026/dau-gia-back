import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from '@Modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { NotificationModule } from './modules/notification/notification.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FileModule } from './modules/file/file.module';
import { SendMailModule } from './modules/send-mail/send-mail.module';
import { RecaptchaModule } from './modules/recaptcha/recaptcha.module';
import { ExampleController } from './common/decorators/swagger/example.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { TenderModule } from './modules/tender/tender.module';
import { AuctionModule } from './modules/auction/auction.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { DonViHanhChinhModule } from './modules/don-vi-hanh-chinh/don-vi-hanh-chinh.module';
import { ToChucProfileModule } from './modules/to-chuc-profile/to-chuc-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 10,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    CronJobModule,
    DatabaseModule,
    RepositoryModule,
    UsersModule,
    NotificationModule,
    FileModule,
    SendMailModule,
    AuthModule,
    RecaptchaModule,
    ScoringModule,
    TenderModule,
    AuctionModule,
    AuditLogModule,
    DonViHanhChinhModule,
    ToChucProfileModule,
  ],
  controllers: [AppController, ExampleController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
