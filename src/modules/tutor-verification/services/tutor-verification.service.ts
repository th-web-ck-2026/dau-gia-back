import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { TutorVerification } from '../entities/tutor-verification.entity';
import { TutorVerificationRepository } from '../repositories/tutor-verification.repository';
import { CreateTutorVerificationDto } from '../dto/create-tutor-verification.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { VerifyLever, VerifyStatus } from '../common/constant';
import { ApiError } from '@/common/exceptions/api-error';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { UserStatus } from '@/modules/user/common/constant';
import { FindOptions, Op } from 'sequelize';
import { UpdateDonV2Dto } from '../dto/updateDonV2.dto';
import { UserModel } from '@/modules/user/models/user.model';

@Injectable()
export class TutorVerificationService extends BaseService<TutorVerification> {
  constructor(
    private readonly tutorVerificationRepository: TutorVerificationRepository,
    private readonly userRepository: UserRepository,
  ) {
    super(tutorVerificationRepository);
  }
  async tutorVerification(
    user: AuthUser,
    lever: Omit<VerifyLever, 'NONE'>,
    verifyDto: CreateTutorVerificationDto,
  ): Promise<any> {
    const verifyData = {
      ...verifyDto,
      verifyLever: lever,
      tutor_id: user.id,
    };
    const tutorVerify = await this.tutorVerificationRepository.getOne({
      where: {
        tutor_id: user.id,
      },
      order: [['createdAt', 'DESC']],
    });
    if (
      [VerifyStatus.PENDING, VerifyStatus.MEETING].includes(tutorVerify?.status)
    ) {
      throw ApiError.BadRequest(
        'Bạn đã có đơn xác minh đang chờ xử lý hoặc đang trong quá trình phỏng vấn.',
      );
    }
    const validateLever = await this.validateVerifyLever(user, lever);
    if (!validateLever) {
      throw ApiError.BadRequest('Cấp xác minh không hợp lệ');
    }
    if (!!tutorVerify && lever === VerifyLever.LEVER_2) {
      return this.tutorVerificationRepository.updateOne(
        {
          verifyLever: lever,
          status: VerifyStatus.PENDING,
        },
        { where: { _id: tutorVerify._id } },
      );
    }
    return this.tutorVerificationRepository.create(verifyData);
  }
  async tutorGetMyDon(user: AuthUser): Promise<TutorVerification> {
    return this.tutorVerificationRepository.getOne({
      where: { tutor_id: user.id },
      order: [['createdAt', 'DESC']],
    });
  }
  // ADMIN HANDLE
  async adminGetPageDonVerify(condition: FindOptions, query: any) {
    return this.tutorVerificationRepository.getPage(
      {
        ...condition,
        include: [
          {
            model: UserModel,
            attributes: ['fullname', 'avatar'],
          },
        ],
      },
      query,
    );
  }
  async adminDuyetDonVerify(idDon: string) {
    const tutorVerify = await this.tutorVerificationRepository.getById(idDon);
    const tutor = await this.userRepository.getOne({
      where: { _id: tutorVerify.tutor_id },
      attributes: ['userStatus', 'verifyLever'],
    });
    if (!tutor || tutor.userStatus !== UserStatus.ACTIVE) {
      return this.tutorVerificationRepository.deleteOne({
        where: { _id: idDon },
      });
    }
    if (tutor.verifyLever !== tutorVerify.verifyLever) {
      await Promise.all([
        this.tutorVerificationRepository.updateOne(
          {
            verifyLever: tutorVerify.verifyLever,
            status: VerifyStatus.APPROVED,
          },
          { where: { _id: idDon } },
        ),
        this.userRepository.updateOne(
          {
            verifyLever: tutorVerify.verifyLever,
            verifyScore: this.getScoreByLever(tutorVerify.verifyLever),
          },
          { where: { _id: tutorVerify.tutor_id } },
        ),
      ]);
    }
  }
  async adminHuyDonVerify(idDon: string, reason: string) {
    const tutorVerify = await this.tutorVerificationRepository.exists({
      where: { _id: idDon },
    });
    if (!tutorVerify) {
      throw ApiError.NotFound('Không tìm thấy đơn xác minh');
    }

    await this.tutorVerificationRepository.updateOne(
      { status: VerifyStatus.REJECTED, reason },
      { where: { _id: idDon } },
    );
  }
  async adminSendEmailAndUpdateMeet(
    idDon: string,
    updateDonV2Dto: UpdateDonV2Dto,
  ) {
    await this.tutorVerificationRepository.updateOne(
      {
        ...updateDonV2Dto,
        status: VerifyStatus.MEETING,
      },
      {
        where: { _id: idDon },
      },
    );
    return true;
  }

  // FUNCTION
  async tutorGetMyVerification(user: AuthUser): Promise<VerifyLever> {
    const tutor = await this.userRepository.getOne({
      where: { _id: user.id},
      attributes: ['verifyLever'],
    });
    if (!tutor) {
      return VerifyLever.NONE;
    }
    return tutor.verifyLever;
  }
  async validateVerifyLever(user: AuthUser, lever: Omit<VerifyLever, 'NONE'>) {
    const currnetVerifyLever = await this.tutorGetMyVerification(user);
    // console.log("currnetVerifyLever : ", currnetVerifyLever)
    if (
      currnetVerifyLever === VerifyLever.NONE &&
      lever !== VerifyLever.LEVER_1
    )
      return false;
    if (
      currnetVerifyLever === VerifyLever.LEVER_1 &&
      lever !== VerifyLever.LEVER_2
    )
      return false;

    return (
      currnetVerifyLever !== VerifyLever.LEVER_2 && currnetVerifyLever !== lever
    );
  }
  private getScoreByLever(lever: VerifyLever) {
    switch (lever) {
      case VerifyLever.LEVER_1:
        return 5;
      case VerifyLever.LEVER_2:
        return 10;
      default:
        return 0;
    }
  }
}
