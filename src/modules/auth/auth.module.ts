import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthProviderService } from './services/auth-provider.service';
import { AuthSessionService } from './services/auth-session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '@Modules/user/user.module';
import { SendMailModule } from '../send-mail/send-mail.module';
import { AuthProviderModel } from './models/auth-provider.model';
import { AuthSessionModel } from './models/auth-session.model';
import { AuthProviderRepository } from './repositories/auth-provider.repository';
import { AuthSessionRepository } from './repositories/auth-session.repository';
import { ToChucProfileModule } from '../to-chuc-profile/to-chuc-profile.module';

@Module({
  imports: [
    SendMailModule,
    UsersModule,
    ToChucProfileModule,
    PassportModule,
    SequelizeModule.forFeature([
      AuthProviderModel,
      AuthSessionModel,
    ]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthProviderService,
    AuthSessionService,
    AuthProviderRepository,
    AuthSessionRepository,
    JwtStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
