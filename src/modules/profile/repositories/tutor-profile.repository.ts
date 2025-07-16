import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { TutorProfile } from '../entities/tutor-profile.entity';
import { TutorProfileModel } from '../models/tutor-profile.model';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { PageableDto } from '@/common/dto/pageable.dto';
import { QueryTypes } from 'sequelize';

@Injectable()
export class TutorProfileRepository extends BaseRepository<TutorProfile> {
  constructor(
    @InjectModel(TutorProfileModel)
    private readonly tutorProfileModel: typeof TutorProfileModel,
    private readonly sequelize: Sequelize,
  ) {
    super(TutorProfileModel);
  }
  async getTutorProfilePage(
    query: QueryOption,
    q?: string,
  ): Promise<PageableDto<any>> {
    const limit = query.limit || 10;
    const offset = query.offset ?? ((query.page || 1) - 1) * limit; // Tính toán offset nếu không được cung cấp
    const order = query.order
      ? `${query.order[0]} ${query.order[1]}`
      : 'tutorProfile._id ASC';

    let whereClause = '';
    const replacements: any = {};

    if (q) {
      const splitQ = q.split(' ').filter((word) => word.trim() !== '');
      if (splitQ.length > 0) {
        const searchConditions: string[] = [];

        splitQ.forEach((word, index) => {
          searchConditions.push(`u.fullname ILIKE :q${index}`);
          replacements[`q${index}`] = `%${word}%`;
        });

        if (searchConditions.length > 0) {
          whereClause = `WHERE (${searchConditions.join(' OR ')})`;
        }
      }
    }

    const rawQuery = `
      SELECT
          tutorProfile.user_id,
          tutorProfile.intro,
          tutorProfile.teaching_subject,
          tutorProfile.certificate,
          u.fullname,
          u.avatar,
          COALESCE(review_stats.total_review, 0) AS total_review,
          COALESCE(review_stats.average_rating, 0) AS average_rating
      FROM
          tutor_profile AS tutorProfile
      JOIN
          "user" AS u ON tutorProfile.user_id = u._id
      LEFT JOIN (
          SELECT
              reviewee_id,
              COUNT(*) AS total_review,
              AVG(rating) AS average_rating
          FROM
              review
          GROUP BY
              reviewee_id
      ) AS review_stats ON u._id = review_stats.reviewee_id
      ${whereClause}
      ORDER BY
          ${order}
      LIMIT
          :limit
      OFFSET
          :offset;
    `;

    replacements.limit = limit;
    replacements.offset = offset;

    const profiles = await this.sequelize.query(rawQuery, {
      replacements: replacements,
      type: QueryTypes.SELECT,
    });
    const total = await this.tutorProfileModel.count({});

    const transformedProfiles = profiles.map((profile: any) => {
      const { fullname, avatar, total_review, average_rating, ...res } =
        profile;
      return {
        ...res,
        user: {
          fullname,
          avatar,
          tutorReview: {
            total: total_review,
            avgRating: Number(average_rating).toFixed(1),
          },
        },
      };
    });

    return PageableDto.create(query, total, transformedProfiles);
  }
}
