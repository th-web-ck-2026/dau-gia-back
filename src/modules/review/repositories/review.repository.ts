import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { Review } from '../entities/review.entity';
import { ReviewModel } from '../models/review.model';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
@Injectable()
export class ReviewRepository extends BaseRepository<Review> {
  constructor(
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,
    private readonly sequelize: Sequelize,
  ) {
    super(ReviewModel);
  }
  async getReviewsOfTutors(tutorIds: string[]): Promise<any> {
    const reviews = await this.sequelize.query(
      `
      SELECT
        reviewee_id,
        COUNT(*) AS total,
        AVG(rating) AS avgRating
      FROM review
      WHERE reviewee_id IN (${tutorIds.map(() => '?').join(',')})
      GROUP BY reviewee_id;
    `,
      {
        replacements: tutorIds,
        type: QueryTypes.SELECT,
      },
    );
    return reviews;
  }
}
