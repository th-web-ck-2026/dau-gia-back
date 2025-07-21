import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Class } from '../entities/class.entity';
import { ClassRepository } from '../repositories/class.repository';
import { CreateClassDto } from '../dto/create-class.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ClassStatus, ManagerClass } from '../common/constant';
import { UpdateClassDto } from '../dto/update-class.dto';
import { BidRepository } from '@/modules/bid/repositories/bid.repository';
import { EnrollmentRepository } from '@/modules/enrollment/repositories/enrollment.repository';
import { ApiError } from '@/common/exceptions/api-error';
import { Sequelize } from 'sequelize-typescript';
import { BidStatus } from '@/modules/bid/common/constant';
import { ClassModel } from '../models/class.model';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { UserModel } from '@/modules/user/models/user.model';
import { Enrollment } from '@/modules/enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '@/modules/enrollment/common/constant';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { PageableDto } from '@/common/dto/pageable.dto';
import { Op } from 'sequelize';

@Injectable()
export class ClassService extends BaseService<Class> {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly classRepository: ClassRepository,
    private readonly bidRepository: BidRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly userRepositroy: UserRepository,
  ) {
    super(classRepository);
  }
  // Student get class
  async getClass(
    condition: any,
    query: QueryOption,
    q?: string,
  ): Promise<PageableDto<Class>> {
    return this.classRepository.getClassPage(query, condition, q);
  }

  async getClassById(id: string): Promise<Class> {
    return this.classRepository.getOne({
      where: { _id: id },
      include: [
        {
          model: UserModel,
          as: 'tutor',
          attributes: ['_id', 'fullname', 'avatar'],
        }
      ]});
  }

  // Tutor create class
  async createClass(
    user: AuthUser,
    createClassDto: CreateClassDto,
  ): Promise<Class> {
    const classData = {
      ...createClassDto,
      tutor_id: user.id,
    };
    return this.classRepository.create(classData);
  }

  async updateClass(
    tutorId: string,
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<Class | null> {
    // TODO: Chỉ cho sửa khi chưa có học viên nào được chọn
    const transaction = await this.sequelize.transaction();
    try {
      const enrollment = await this.enrollmentRepository.exists({
        where: { class_id: id },
        transaction,
      });

      if (enrollment) {
        throw ApiError.BadRequest('Class has enrollment');
      }

      const res = await this.classRepository.updateOne(updateClassDto, {
        where: { _id: id, tutor_id: tutorId },
        transaction,
      });
      if (!res) {
        throw ApiError.BadRequest('Delete bid failed');
      }
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async deleteClass(tutorId: string, id: string): Promise<Class | null> {
    // TODO: Chỉ cho xoá khi chưa có học viên nào được chọn
    const transaction = await this.sequelize.transaction();
    try {
      const enrollment = await this.enrollmentRepository.exists({
        where: { class_id: id },
        transaction,
      });

      if (enrollment) {
        throw ApiError.BadRequest('Class has enrollment');
      }

      const res = await this.classRepository.deleteOne({
        where: { _id: id, tutor_id: tutorId },
        transaction,
      });
      if (!res) {
        throw ApiError.BadRequest('Delete bid failed');
      }
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async closeClass(tutorId: string, id: string): Promise<Class | null> {
    return this.classRepository.updateOne(
      { status: ClassStatus.CLOSED },
      { where: { _id: id, status: ClassStatus.OPEN, tutor_id: tutorId } },
    );
  }
  // Tutor Manager class
  async tutorGetManagerClass(tutorId: string): Promise<ManagerClass[]> {
    const res = await this.classRepository.getMany({
      where: { tutor_id: tutorId },
      order: [['createdAt', 'DESC']],
    });
    const tutorClass = await Promise.all(
      res.map(async (item) => {
        const enrollmentClass = await this.enrollmentRepository.count({
          where: { class_id: item._id },
        });
        const bidClass = await this.bidRepository.getMany({
          where: { class_id: item._id },
        });
        const peddingBid = bidClass.reduce(
          (total, bid) =>
            bid.status === BidStatus.PENDING ? total + 1 : total,
          0,
        );

        return {
          ...item,
          enrollment: enrollmentClass,
          totalBid: bidClass.length,
          peddingBid: peddingBid,
        };
      }),
    );
    return tutorClass;
  }
  async studentGetClass(studentId: string): Promise<Class[] | any> {
    const bid = await this.bidRepository.getMany({
      where: { student_id: studentId },
      order: [['createdAt', 'DESC']],
      attributes: ['_id', 'class_id', 'status', 'bid_price'],
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: [
            '_id',
            'tutor_id',
            'title',
            'subject',
            'mode',
            'location',
            'status',
          ],
          include: [
            {
              model: UserModel,
              as: 'tutor',
              attributes: ['_id', 'fullname', 'avatar'],
            },
          ],
        },
      ],
    });
    const bidClass = await Promise.all(
      bid.map(async (bid) => {
        const classInfo = bid.class as Class;
        classInfo.tutor['tutorReview'] =
          await this.userRepositroy.getTutorReview(classInfo.tutor_id);
        let enrollment: Enrollment;
        if (bid.status === BidStatus.ACCEPTED) {
          enrollment = await this.enrollmentRepository.getOne({
            where: { class_id: classInfo._id },
            attributes: ['status'],
          });
          if (enrollment.status === EnrollmentStatus.STUDYING) {
            const tutorInfo = await this.userRepositroy.getInfo(
              classInfo.tutor_id,
            );
            classInfo.tutor = {
              ...classInfo.tutor,
              ...tutorInfo,
            };
          } else {
            // self talk
            // Xác nhận học xong có thể đánh giá
            // Có thể không cần check cứ cho nhấn vào và review rồi thì xem lại không thì review
          }
        }
        return {
          ...bid,
          classStatus: enrollment?.status || bid.status,
          //Đang học, Đã học xong, Đã chào giá, Bị từ chối.
          //STUDYING, COMPLETE, PENDING, REJECT
        };
      }),
    );

    return bidClass;
  }
}
