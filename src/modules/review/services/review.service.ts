import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Review } from '../entities/review.entity';
import { ReviewRepository } from '../repositories/review.repository';
import { EnrollmentRepository } from '@/modules/enrollment/repositories/enrollment.repository';
import { ClassRepository } from '@/modules/class/repositories/class.repository';
import { ApiError } from '@/common/exceptions/api-error';
import { UserModel } from '@/modules/user/models/user.model';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { CreateReviewDto } from '../dto/create-review.dto';
import { EnrollmentStatus } from '@/modules/enrollment/common/constant';
import { ClassModel } from '@/modules/class/models/class.model';
import { NotificationType } from '@/modules/notification/common/constant';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { PageableDto } from '@/common/dto/pageable.dto';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { Op } from 'sequelize';

@Injectable()
export class ReviewService extends BaseService<Review> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    // private readonly classRepository: ClassRepository,
    private readonly notificationService: NotificationService,
  ) {
    super(reviewRepository);
  }
  async getListReviewsOfTutor(
    tutorId: string,
    query: QueryOption,
  ): Promise<PageableDto<Review>> {
    const where: any = { reviewee_id: tutorId };
    const review = await this.reviewRepository.getPage(
      {
        where,
        include: [
          {
            model: UserModel,
            as: 'reviewer',
            attributes: ['fullname', 'avatar'],
          },
        ],
        attributes: ['rating', 'comment', 'createdAt'],
      },
      query,
    );
    return review;
  }
  async getStatisticOfTutor(
    tutorId: string,
  ) {
    const where: any = { reviewee_id: tutorId };
    const review = await this.reviewRepository.getMany({
      where,
      attributes: ['rating'],
    });
    const totalReview = review.length;
    const totalRating = review.reduce((total, item) => total + item.rating, 0);
    return {
      totalReview,
      averageRating: totalReview > 0 ? totalRating / totalReview : 0,
      review: review.map((item) => item.rating),
    };

  }

  async getReviewsOfClass(
    classId: string,
    studentId?: string,
  ): Promise<Review[]> {
    const where: any = { class_id: classId };
    if (studentId) {
      where.reviewer_id = studentId;
    }
    const review = await this.reviewRepository.getMany({
      where,
      attributes: ['rating', 'comment', 'createdAt'],
      include: [
        {
          model: UserModel,
          as: 'reviewer',
          attributes: ['fullname', 'avatar'],
        },
      ],
    });
    return review;
  }

  async studentCreateReviewClass(
    user: AuthUser,
    classId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const enrollment = await this.enrollmentRepository.getOne({
      where: { class_id: classId, student_id: user.id },
      attributes: ['_id', 'status'],
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['tutor_id', 'title'],
        },
      ],
    });
    if (!enrollment) {
      throw ApiError.NotFound('Enrollment not found');
    }
    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw ApiError.BadRequest('Enrollment is not completed');
    }

    const review = await this.reviewRepository.exists({
      where: { enrollment_id: enrollment._id, reviewer_id: user.id },
    });
    if (review) {
      throw ApiError.Conflict('You have already review for this class');
    }

    const reviewData = {
      ...createReviewDto,
      reviewee_id: enrollment.class.tutor_id,
      class_id: classId,
      enrollment_id: enrollment._id,
      reviewer_id: user.id,
    };
    const res = await this.reviewRepository.create(reviewData);
    if (!res) {
      throw ApiError.BadRequest('Create review failed');
    }
    // send notification to tutor
    await this.notificationService.createNotification({
      user_id: enrollment.class.tutor_id,
      type: NotificationType.COURSE,
      title: `Học viên - ${user.fullname} đã đánh giá lớp - ${enrollment.class.title}`,
      content: `Học viên - ${user.fullname} đã đánh giá lớp - ${enrollment.class.title}. 
      Bạn có thể vào lớp học để xem đánh giá của học viên.`,
    });

    return res;
  }
  async getReviewOfListTutorIds(
    tutorIds: string[],
  ) {
    return this.reviewRepository.getReviewsOfTutors(tutorIds);
  }
}
