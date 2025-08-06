import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TutorVerificationService } from '../services/tutor-verification.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { FindOptions } from 'sequelize';
import { UpdateDonV2Dto } from '../dto/updateDonV2.dto';
import { TutorVerification } from '../entities/tutor-verification.entity';

@Auth(UserRoles.ADMIN)
@Controller('tutor-verification/admin')
export class TutorVerificationAdminController {
  constructor(
    private readonly tutorVerificationService: TutorVerificationService,
  ) {}

  @Get()
  adminGetPageDonVerify(
    @RequestCondition(TutorVerification) condition: FindOptions,
    @Query() query: any,
  ) {
    return this.tutorVerificationService.adminGetPageDonVerify(condition, query);
  }

  @Patch(':id/approve')
  adminDuyetDonVerify(@Param('id') id: string) {
    return this.tutorVerificationService.adminDuyetDonVerify(id);
  }

  @Patch(':id/reject')
  adminHuyDonVerify(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.tutorVerificationService.adminHuyDonVerify(id, reason);
  }

  @Patch(':id/meet')
  adminSendEmailAndUpdateMeet(
    @Param('id') id: string,
    @Body() updateDonV2Dto: UpdateDonV2Dto,
  ) {
    return this.tutorVerificationService.adminSendEmailAndUpdateMeet(
      id,
      updateDonV2Dto,
    );
  }
}
