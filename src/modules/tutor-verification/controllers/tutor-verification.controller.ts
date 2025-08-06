import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TutorVerificationService } from '../services/tutor-verification.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { CreateTutorVerificationDto } from '../dto/create-tutor-verification.dto';
import { VerifyLever } from '../common/constant';

@Auth(UserRoles.TUTOR)
@Controller('tutor-verification')
export class TutorVerificationController {
  constructor(
    private readonly tutorVerificationService: TutorVerificationService,
  ) {}
  @Post()
  create(
    @ReqUser() user: AuthUser,
    @Query('lever') lever: VerifyLever,
    @Body() createTutorVerificationDto: CreateTutorVerificationDto,
  ) {
    return this.tutorVerificationService.tutorVerification(
      user,
      lever,
      createTutorVerificationDto,
    );
  }
  @Get('me')
  getMe(@ReqUser() user: AuthUser) {
    return this.tutorVerificationService.tutorGetMyDon(user);
  }
}
