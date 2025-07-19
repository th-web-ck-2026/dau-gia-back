import { Injectable } from '@nestjs/common';
import { BidService } from '@/modules/bid/services/bid.service';
import { EnrollmentService } from '@/modules/enrollment/services/enrollment.service';
import { ReviewService } from '@/modules/review/services/review.service';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { CreateAdminReviewDto } from '../dto/create-admin-review.dto';

@Injectable()
export class AdminFlowService {
  constructor(
    private readonly bidService: BidService,
    private readonly enrollmentService: EnrollmentService,
    private readonly reviewService: ReviewService,
  ) {}

  /**
   * Admin selects a student's bid on behalf of a tutor.
   * @param admin - The authenticated admin user.
   * @param tutorId - The ID of the tutor.
   * @param bidId - The ID of the bid to be accepted.
   * @returns The result of the bid selection.
   */
  async adminSelectStudent(admin: AuthUser, tutorId: string, bidId: string) {
    // TODO: Add validation to ensure the user is an admin.
    return this.bidService.tutorSelectBidStudent(tutorId, bidId);
  }

  /**
   * Admin marks an enrollment as completed on behalf of a student.
   * @param admin - The authenticated admin user.
   * @param studentId - The ID of the student.
   * @param classId - The ID of the class.
   * @returns The updated enrollment.
   */
  async adminCompleteEnrollment(admin: AuthUser, studentId: string, classId: string) {
    // TODO: Add validation to ensure the user is an admin.
    return this.enrollmentService.studentCompleteClass(studentId, classId);
  }

  /**
   * Admin creates a review on behalf of a student for a class.
   * @param admin - The authenticated admin user.
   * @param createAdminReviewDto - The DTO containing review details.
   * @returns The created review.
   */
  async adminCreateReview(admin: AuthUser, createAdminReviewDto: CreateAdminReviewDto) {
    // TODO: Add validation to ensure the user is an admin.
    const { classId, studentId, rating, comment } = createAdminReviewDto;
    const studentAuthUser: AuthUser = { id: studentId, fullname: 'Admin-Impersonated Student', email: '', phone: '', role: 'STUDENT', comparePassword: async () => false }; // Mock AuthUser for student
    return this.reviewService.studentCreateReviewClass(studentAuthUser, classId, { rating, comment });
  }
}
