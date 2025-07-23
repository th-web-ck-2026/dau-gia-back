import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Bid } from '../entities/bid.entity';
import { BidRepository } from '../repositories/bid.repository';
import { CreateBidDto } from '../dto/create-bid.dto';
import { UpdateBidDto } from '../dto/update-bid.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ClassRepository } from '@/modules/class/repositories/class.repository';
import { ApiError } from '@/common/exceptions/api-error';
import { BidStatus } from '../common/constant';
import { ClassModel } from '@/modules/class/models/class.model';
import { Class } from '@/modules/class/entities/class.entity';
import { ClassStatus } from '@/modules/class/common/constant';
import { Sequelize } from 'sequelize-typescript';
import { EnrollmentRepository } from '@/modules/enrollment/repositories/enrollment.repository';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NotificationType } from '@/modules/notification/common/constant';
import { User } from '@/modules/user/entities/user.entity';
import { UserModel } from '@/modules/user/models/user.model';
import { SendMailService } from '@/modules/send-mail/services/send-mail.service';

@Injectable()
export class BidService extends BaseService<Bid> {
  constructor(
    private readonly bidRepository: BidRepository,
    private readonly classRepository: ClassRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly notificationService: NotificationService,
    private readonly sendMailService: SendMailService,
    private readonly sequelize: Sequelize,
  ) {
    super(bidRepository);
  }

  async getBidsOfClass(classId: string): Promise<Bid[]> {
    return this.bidRepository.getMany({
      where: { class_id: classId },
      include: [
        {
          model: UserModel,
          as: 'student',
          attributes: ['_id', 'fullname', 'avatar'],
        },
      ],
    });
  }

  async createBid(
    user: AuthUser,
    classId: string,
    createBidDto: CreateBidDto,
  ): Promise<Bid> {
    const bidClass = await this.classRepository.getOne({
      where: { _id: classId },
      include: [
        {
          model: UserModel,
          as: 'tutor',
          attributes: ['_id', 'fullname', 'email'],
        },
      ],
    });
    if (!bidClass) {
      throw ApiError.NotFound('Class not found');
    }
    if (bidClass.status !== ClassStatus.OPEN) {
      throw ApiError.BadRequest('Class is not open');
    }
    const existBid = await this.bidRepository.exists({
      where: { class_id: classId, student_id: user.id },
    });
    if (existBid) {
      throw ApiError.Conflict('You have already bid for this class');
    }
    const bidData = {
      ...createBidDto,
      class_id: classId,
      student_id: user.id,
    };
    const res = await this.bidRepository.create(bidData);
    if (!res) {
      throw ApiError.BadRequest('Create bid failed');
    }
    // send notification to tutor
    await this.notificationService.createNotification({
      user_id: bidClass.tutor_id,
      type: NotificationType.COURSE,
      title: `Học viên - ${user.fullname} đã chào giá cho lớp - ${bidClass.title}`,
      content: `Học viên - ${user.fullname} đã chào giá cho lớp - ${bidClass.title} với giá là ${res.bid_price} VNĐ
      Hãy vào lớp học để xem chi tiết nhé.`,
    });
    this.sendMailService.sendBidCreate(
      { fullname: user.fullname } as User,
      res,
      bidClass.tutor,
      bidClass,
    );
    return res;
  }
  async updateBid(
    user: AuthUser,
    id: string,
    updateBidDto: UpdateBidDto,
  ): Promise<Bid> {
    const bid = await this.bidRepository.getOne({
      where: { _id: id, student_id: user.id },
    });
    if (!bid) {
      throw ApiError.NotFound('Bid not found');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw ApiError.BadRequest('Bid cant be updated');
    }
    const res = await this.bidRepository.updateOne(updateBidDto, {
      where: { _id: id, student_id: user.id },
    });
    if (!res) {
      throw ApiError.BadRequest('Update bid failed');
    }
    return res;
  }
  async deleteBid(user: AuthUser, id: string): Promise<Bid> {
    const res = await this.bidRepository.deleteOne({
      where: { _id: id, student_id: user.id },
    });
    if (!res) {
      throw ApiError.BadRequest('Delete bid failed');
    }
    return res;
  }
  // Tutor handle
  // tutor select student
  async tutorSelectBidStudent(tutorId: string, bidId: string): Promise<any> {
    const bid = await this.bidRepository.getOne({
      where: { _id: bidId },
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['_id', 'title', 'tutor_id', 'status', 'max_student'],
          include: [
            {
              model: UserModel,
              as: 'tutor',
              attributes: ['_id', 'fullname'],
            }
          ]
        },
        {
          model: UserModel,
          as: 'student',
          attributes: ['_id', 'fullname', 'email'],
        }
      ],
    });
    const bidClass = bid.class as Class;
    if (!bid) {
      throw ApiError.NotFound('Bid not found');
    }
    if (bidClass.tutor_id !== tutorId) {
      throw ApiError.BadRequest('You are not the tutor of this bid');
    }
    if (bidClass.status !== ClassStatus.OPEN) {
      throw ApiError.BadRequest('Class is not open');
    }
    // Handle for class
    const countAcceptBid = await this.getAllBidsAcceptOfClass(
      bidClass._id,
      BidStatus.ACCEPTED,
    );

    const transaction = await this.sequelize.transaction();
    try {
      const newBid = await this.bidRepository.updateOne(
        { status: BidStatus.ACCEPTED },
        { where: { _id: bidId }, transaction },
      );
      if (!newBid) {
        throw ApiError.BadRequest('Update bid failed');
      }
      await this.enrollmentRepository.create(
        {
          class_id: bidClass._id,
          student_id: bid.student_id,
          bid_id: bidId,
        },
        {
          transaction,
        },
      );
      if (countAcceptBid + 1 >= bidClass.max_student) {
        await this.classRepository.updateOne(
          { status: ClassStatus.FULL },
          { where: { _id: bidClass._id }, transaction },
        );
      }
      // send notification to student
      await this.notificationService.createNotification({
        user_id: bid.student_id,
        type: NotificationType.COURSE,
        title: `Chào giá của bạn ở lớp - ${bidClass.title} đã được chấp nhận`,
        content: `Bạn đã được chấp nhận vào lớp học - ${bidClass.title} với giá là ${newBid.bid_price} VNĐ
        Hãy vào lớp học để nhận thông tin liên hệ với gia sư nhé.`,
      });
      await this.sendMailService.sendTutorSelectBid(
        bid.student,
        newBid,
        bidClass.tutor,
        bidClass,
      )
      await transaction.commit();
      return newBid;
    } catch (error) {
      await transaction.rollback();
      throw ApiError.InternalServerError(error);
    }
  }
  // Tutor reject student
  async tutorRejectBidStudent(
    tutorId: string,
    bidId: string,
  ): Promise<Bid | any> {
    const bid = await this.bidRepository.getOne({
      where: { _id: bidId },
      include: [
        {
          model: ClassModel,
          as: 'class',
          attributes: ['_id', 'tutor_id', 'status', 'title'],
        },
      ],
    });
    if (!bid) {
      throw ApiError.NotFound('Bid not found');
    }
    const bidClass = bid.class;
    if (bidClass.tutor_id !== tutorId) {
      throw ApiError.Forbidden('You are not the tutor of this bid');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw ApiError.BadRequest('Bid cant be updated');
    }

    const transaction = await this.sequelize.transaction();
    try {
      await this.bidRepository.updateOne(
        { status: BidStatus.REJECTED },
        { where: { _id: bidId } },
      );
      // send notification to student
      await this.notificationService.createNotification({
        user_id: bid.student_id,
        type: NotificationType.COURSE,
        title: `Chào giá của bạn ở lớp - ${bidClass.title} đã bị từ chối`,
        content: `Bạn đã bị từ chối ở lớp học - ${bidClass.title} 
        Hãy vào lớp học để xem lý do từ chối nhé.`,
      });
      await transaction.commit();
      return bid;
    } catch (error) {
      await transaction.rollback();
      throw ApiError.InternalServerError(error);
    }
  }
  // Tutor get manager bid of class

  // FUNCTION
  private async getAllBidsAcceptOfClass(
    classId: string,
    status: BidStatus = null,
  ): Promise<number> {
    const where = {
      class_id: classId,
    };
    if (status) {
      where['status'] = status;
    }
    const countBid = await this.bidRepository.count({
      where,
    });
    return countBid;
  }

  async rejectAllPenddingBidOfClass(classId: string): Promise<void> {
    const bidClass = await this.classRepository.exists({
      where: { _id: classId },
    });
    if (!bidClass) {
      throw ApiError.NotFound('Class not found');
    }
    await this.bidRepository.updateMany(
      { status: BidStatus.REJECTED },
      { where: { class_id: classId } },
    );
  }
}
