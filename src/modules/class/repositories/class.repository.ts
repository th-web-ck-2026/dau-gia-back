import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { Class } from '../entities/class.entity';
import { ClassModel } from '../models/class.model';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';
import { QueryTypes } from 'sequelize';
import { buildWhereClause } from '@Common/utils/sql.utils';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ClassRepository extends BaseRepository<Class> {
  constructor(
    @InjectModel(ClassModel)
    private readonly classModel: typeof ClassModel,
    private sequelize: Sequelize,
  ) {
    super(ClassModel);
  }
  async getClassPage(
    query: QueryOption,
    condition: any,
    q?: string,
  ): Promise<PageableDto<any>> {
    const limit = query.limit || 10;
    const offset = query.offset ?? ((query.page || 1) - 1) * limit;
    let order: string;
    const defaultOrderByDate = 'CAST(class."createdAt" AS DATE) DESC';
    const defaultTieBreaker = 'score DESC';
    const defaultOrderById = 'class._id DESC';

    if (query.order && Array.isArray(query.order) && query.order.length > 0) {
      const customOrderParts = query.order.map(
        ([field, direction]) => `"${field}" ${direction}`,
      );

      const hasCustomCreatedAt = query.order.some(
        ([field]) => field === 'createdAt',
      );

      const finalOrderParts = [];
      finalOrderParts.push(defaultOrderByDate);
      if (!hasCustomCreatedAt) {
        finalOrderParts.push(...customOrderParts);
      }
      
      finalOrderParts.push(defaultTieBreaker);
      finalOrderParts.push(defaultOrderById);

      order = finalOrderParts.join(', ');
    } else {
      order = `${defaultOrderByDate}, ${defaultTieBreaker}`;
    }
    const replacements: any = {};

    const { whereClause, replacements: whereReplacements } = buildWhereClause(
      condition,
      'class',
    );
    Object.assign(replacements, whereReplacements);

    let searchWhereClause = '';
    if (q) {
      const searchConditions: string[] = [];
      const searchWords = q.split(' ').filter((w) => w.length > 0);
      searchWords.forEach((word, index) => {
        const paramName = `q_${index}`;
        searchConditions.push(
          `(class.title ILIKE :${paramName} OR
          class.subject ILIKE :${paramName} OR
          class.description ILIKE :${paramName} OR
          class.location ILIKE :${paramName} OR
          tutor.fullname ILIKE :${paramName})`,
        );
        replacements[paramName] = `%${word}%`;
      });
      if (searchConditions.length > 0) {
        searchWhereClause = searchConditions.join(' AND ');
      }
    }

    let finalWhereClause = '';
    if (whereClause && searchWhereClause) {
      finalWhereClause = `WHERE ${whereClause} AND ${searchWhereClause}`;
    } else if (whereClause) {
      finalWhereClause = `WHERE ${whereClause}`;
    } else if (searchWhereClause) {
      finalWhereClause = `WHERE ${searchWhereClause}`;
    }

    const rawQuery = `
      SELECT
          class.*,
          tutor._id AS tutor_id,
          tutor.fullname AS tutor_fullname,
          tutor.avatar AS tutor_avatar,
          COALESCE(review_stats.total_review, 0) AS total_review,
          COALESCE(review_stats.average_rating, 0) AS average_rating,
          COALESCE(bid_counts.bid_count, 0) AS bid_count,
          (COALESCE(review_stats.total_review, 0) *
            COALESCE(review_stats.average_rating, 0) *
            2 +
            COALESCE(tutorProfile."profileScore", 0) +
            COALESCE(bid_counts.bid_count, 0)) AS score
      FROM
          class
      JOIN
          "user" AS tutor ON class.tutor_id = tutor._id
      LEFT JOIN (
          SELECT
              reviewee_id,
              COUNT(*) AS total_review,
              AVG(rating) AS average_rating
          FROM
              review
          GROUP BY
              reviewee_id
      ) AS review_stats ON class.tutor_id = review_stats.reviewee_id
      LEFT JOIN (
          SELECT
              class_id,
              COUNT(*) AS bid_count
          FROM
              bid
          GROUP BY
              class_id
      ) AS bid_counts ON class._id = bid_counts.class_id
      LEFT JOIN (
          SELECT
              user_id,
              "profileScore"
          FROM
              tutor_profile
      ) AS tutorProfile ON class.tutor_id = tutorProfile.user_id
      ${finalWhereClause}
      ORDER BY
          ${order}
      LIMIT
          :limit
      OFFSET
          :offset;
    `;

    replacements.limit = limit;
    replacements.offset = offset;

    const classes = await this.sequelize.query(rawQuery, {
      replacements: replacements,
      type: QueryTypes.SELECT,
    });

    const rawCountQuery = `
      SELECT
          COUNT(DISTINCT class._id)
      FROM
          class
      JOIN
          "user" AS tutor ON class.tutor_id = tutor._id
      ${finalWhereClause};
    `;

    const countReplacements = { ...replacements };
    delete countReplacements.limit;
    delete countReplacements.offset;

    const totalResult = await this.sequelize.query(rawCountQuery, {
      replacements: countReplacements,
      type: QueryTypes.SELECT,
    });

    const total = totalResult[0]
      ? parseInt(Object.values(totalResult[0])[0] as string, 10)
      : 0;

    const transformedClasses = classes.map((cls: any) => {
      const {
        tutor_id,
        tutor_fullname,
        tutor_avatar,
        total_review,
        average_rating,
        score,
        ...res
      } = cls;
      return {
        ...res,
        score: Number(score).toFixed(1),
        tutor: {
          _id: tutor_id,
          fullname: tutor_fullname,
          avatar: tutor_avatar,
          tutorReview: {
            total: total_review,
            avgRating: Number(average_rating).toFixed(1),
          },
        },
      };
    });

    return PageableDto.create(query, total, transformedClasses);
  }
}
