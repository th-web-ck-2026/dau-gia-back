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
