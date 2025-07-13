import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/base/base.repository';
import { User } from '../entities/user.entity';
import { UserModel } from '../models/user.model';
import { ApiError } from '@/common/exceptions/api-error';
import { ReviewModel } from '@/modules/review/models/review.model';
import { ClassModel } from '@/modules/class/models/class.model';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoles } from '../common/constant';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
  ) {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.getOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.getMany({ where: { isActive: true } });
  }
  // forTutor
  async getTutorReview(tutorId: string): Promise<unknown> {
    const tutor = await this.getOne({
      where: { _id: tutorId },
    });
    if (!tutor || tutor.role !== UserRoles.TUTOR) {
      throw ApiError.NotFound('Tutor not found');
    }
    // get all comment from list tutor class _id use sequelize $in
    const review = await this.reviewModel.findAll({
      where: {
        reviewee_id: tutorId,
      },
      attributes: ['rating'],
    });
    const totalRating = review.reduce(
      (total, item) => total + item.toJSON().rating,
      0,
    );
    const avgRating = totalRating > 0 ? totalRating / review.length : 0;
    return {
      total: review.length,
      avgRating: avgRating.toFixed(1),
    };
  }
  async getInfo(userId: string): Promise<Pick<User, 'phone' | 'email'>> {
    const user = await this.getOne({ where: { _id: userId } });
    if (!user) {
      throw ApiError.NotFound('User not found');
    }
    return {
      phone: user.phone,
      email: user.email,
    };
  }
}
