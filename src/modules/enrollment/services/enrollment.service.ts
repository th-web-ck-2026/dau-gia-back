import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { ApiError } from '@/common/exceptions/api-error';
import { UserModel } from '@/modules/user/models/user.model';
import { BidModel } from '@/modules/bid/models/bid.model';
import { StudentProfileRepository } from '@/modules/profile/repositories/student-profile.repository';
import { ClassRepository } from '@/modules/class/repositories/class.repository';
import { EnrollmentStatus, TutorManagerEnrollment } from '../common/constant';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { ClassModel } from '@/modules/class/models/class.model';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NotificationType } from '@/modules/notification/common/constant';

@Injectable()
export class EnrollmentService extends BaseService<Enrollment> {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly studentProfileRepository: StudentProfileRepository,
    private readonly classRepository: ClassRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {
    super(enrollmentRepository);
  }
  async getTotalStudentEnrollByTutor(tutorId: string): Promise<number> {
    return this.enrollmentRepository.count({
      where: { status: EnrollmentStatus.COMPLETED },
      include: [
        {
          model: ClassModel,
          as: 'class',
          where: { tutor_id: tutorId },
        },
      ],
    });
  }
  async tutorGetEnrollmentsOfClass(
    tutorId: string,
    classId: string,
  ): Promise<TutorManagerEnrollment[]> {
    const enrollmentClass = await this.classRepository.exists({
      where: { _id: classId, tutor_id: tutorId },
    });
    if (!enrollmentClass) {
      throw ApiError.NotFound('Class not found');
    }
    const enrollment = await this.enrollmentRepository.getMany({
      where: { class_id: classId },
      include: [
        {
          model: UserModel,
          as: 'student',
          attributes: ['_id', 'fullname', 'avatar'],
        },
        {
          model: BidModel,
          as: 'bid',
          attributes: ['_id', 'bid_price', 'message', 'address'],
        },
      ],
    });
    if (!enrollment) {
      throw ApiError.NotFound('Enrollment not found');
    }
    const res = await Promise.all(
      enrollment.map(async (item) => {
        let student = item.student as UserModel;
        const studentProfile = await this.studentProfileRepository.getOne({
          where: { user_id: item.student._id },
          attributes: ['school', 'grade'],
        });
        let studentInfo: Pick<UserModel, 'phone' | 'email'>;
        if (item.status === EnrollmentStatus.STUDYING) {
          studentInfo = await this.userRepository.getInfo(item.student._id);
        }
        item.student = {
          ...student,
          ...studentInfo,
          ...studentProfile,
        };

        return {
          ...item,
        };
      }),
    );
    return res;
  }
  async studentCompleteClass(
    studentId: string,
    classId: string,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.getOne({
      where: { student_id: studentId, class_id: classId },
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['title', 'tutor_id'],
        },
        {
          model: UserModel,
          as: 'student',
          attributes: ['fullname'],
        },
      ],
      attributes: ['status'],
    });
    if (!enrollment) {
      throw ApiError.NotFound('Enrollment not found');
    }
    const completedAt = new Date();
    const res = await this.enrollmentRepository.updateOne(
      { status: EnrollmentStatus.COMPLETED, completed_at: completedAt },
      {
        where: { student_id: studentId, class_id: classId },
      },
    );
    // send notification to tutor
    await this.notificationService.createNotification({
      user_id: enrollment.class.tutor_id,
      type: NotificationType.COURSE,
      title: `Học viên - ${enrollment.student.fullname} đã hoàn thành lớp - ${enrollment.class.title}`,
      content: `Học viên - ${enrollment.student.fullname} đã hoàn thành lớp - ${enrollment.class.title}. 
      Bạn có thể vào lớp học để xem đánh giá của học viên.`,
    });
    return res;
  }
}
