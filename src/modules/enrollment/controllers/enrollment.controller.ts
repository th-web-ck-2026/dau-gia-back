import { Controller, Get, Param, Post } from '@nestjs/common';
import { EnrollmentService } from '../services/enrollment.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
@Auth()
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @ApiOperation({ summary: 'Gia sư lấy thông tin học viên tham gia lớp học' })
  @Roles(UserRoles.TUTOR)
  @Get('class/:classId/tutor')
  async getEnrollmentsOfClass(
    @ReqUser() user,
    @Param('classId') classId: string,
  ) {
    return this.enrollmentService.tutorGetEnrollmentsOfClass(user.id, classId);
  }
  @Public()
  @ApiOperation({ summary: 'Gia sư lấy tổng số học viên đã học gia sư' })
  @Get('tutor/:tutorId/total-student')
  async getTotalStudentEnrollByTutor(
    @Param('tutorId') tutorId: string,
  ) {
    return this.enrollmentService.getTotalStudentEnrollByTutor(tutorId);
  }
  @ApiOperation({ summary: 'Học viên xác nhận hoàn thành lớp học' })
  @Roles(UserRoles.STUDENT)
  @Post('class/:classId/student/complete')
  async studentCompleteClass(
    @ReqUser() user,
    @Param('classId') classId: string,
  ) {
    return this.enrollmentService.studentCompleteClass(user.id, classId);
  }
}
