import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminFlowService } from '../services/admin-flow.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { CreateAdminReviewDto } from '../dto/create-admin-review.dto';

@Controller('admin/flow')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN)
export class AdminFlowController {
  constructor(private readonly adminFlowService: AdminFlowService) {}

  @Post('select-student/:tutorId/:bidId')
  async adminSelectStudent(
    @ReqUser() admin: AuthUser,
    @Param('tutorId') tutorId: string,
    @Param('bidId') bidId: string,
  ) {
    return this.adminFlowService.adminSelectStudent(admin, tutorId, bidId);
  }

  @Post('complete-enrollment/:studentId/:classId')
  async adminCompleteEnrollment(
    @ReqUser() admin: AuthUser,
    @Param('studentId') studentId: string,
    @Param('classId') classId: string,
  ) {
    return this.adminFlowService.adminCompleteEnrollment(admin, studentId, classId);
  }

  @Post('create-review')
  async adminCreateReview(
    @ReqUser() admin: AuthUser,
    @Body() createAdminReviewDto: CreateAdminReviewDto,
  ) {
    return this.adminFlowService.adminCreateReview(admin, createAdminReviewDto);
  }
}
