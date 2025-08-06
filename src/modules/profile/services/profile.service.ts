import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiError } from '@Exceptions/api-error';
import { StudentProfileRepository } from '../repositories/student-profile.repository';
import { TutorProfileRepository } from '../repositories/tutor-profile.repository';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { UserRoles } from '@/modules/user/common/constant';
import { UpdateTutorProfileDto } from '../dto/update-tutor-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';
import { User } from '@/modules/user/entities/user.entity';
import { TutorProfile } from '../entities/tutor-profile.entity';
import { StudentProfile } from '../entities/stutent-profile.entity';
import { UserModel } from '@/modules/user/models/user.model';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ReviewRepository } from '@/modules/review/repositories/review.repository';
import { Op } from 'sequelize';
import { ExperienceYear } from '../common/constant';

@Injectable()
export class ProfileService implements OnModuleInit {
  constructor(
    private readonly tutorProfileRepository: TutorProfileRepository,
    private readonly studentProfileRepository: StudentProfileRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async onModuleInit() {
    const tutorProfiles = await this.tutorProfileRepository.getMany({});
    const updatePromises = tutorProfiles.map(async (profile) => {
      const score = await this.calcTutorProfileScore(profile.user_id, profile);
      return this.tutorProfileRepository.updateOne(
        { profileScore: score },
        { where: { _id: profile._id } },
      );
    });

    await Promise.all(updatePromises);
  }
  async getMeProfile(user: AuthUser): Promise<unknown> {
    if (user.role === UserRoles.STUDENT) {
      return this.getStudentProfile(user.id);
    }
    return this.getTutorProfile(user.id);
  }
  // owner is tutor
  async getTutorProfile(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.getOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw ApiError.NotFound('Profile not found');
    }
    profile['tutorReview'] = await this.userRepository.getTutorReview(userId);
    return profile;
  }
  async getStudentProfile(userId: string): Promise<StudentProfile> {
    const profile = await this.studentProfileRepository.getOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw ApiError.NotFound('Profile not found');
    }
    return profile;
  }
  // public
  async getTutorProfilePublic(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.getOne({
      where: { user_id: userId },
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['fullname', 'avatar', 'address', 'verifyLever'],
        },
      ],
    });
    if (!profile) {
      throw ApiError.NotFound('Profile not found');
    }
    profile['tutorReview'] = await this.userRepository.getTutorReview(userId);
    return profile;
  }

  // Owner update profile
  async updateMeProfile(user: AuthUser, updateProfileDto: any): Promise<any> {
    if (user.role === UserRoles.STUDENT) {
      return this.updateStudentProfile(user.id, updateProfileDto);
    }
    return this.updateTutorProfile(user.id, updateProfileDto);
  }

  async updateTutorProfile(
    userId: string,
    updateTutorProfileDto: UpdateTutorProfileDto,
  ): Promise<any> {
    const tutorProfile = await this.tutorProfileRepository.updateOne(
      updateTutorProfileDto,
      {
        where: { user_id: userId },
      },
    );
    const newProfileScore = await this.calcTutorProfileScore(
      userId,
      tutorProfile,
    );
    // console.log(newProfileScore)
    return this.tutorProfileRepository.updateOne(
      { profileScore: newProfileScore },
      {
        where: { user_id: userId },
      },
    );
  }

  async updateStudentProfile(
    userId: string,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    return this.studentProfileRepository.updateOne(updateStudentProfileDto, {
      where: { user_id: userId },
    });
  }

  async createProfile(user: User): Promise<any> {
    if (user.role === UserRoles.STUDENT) {
      return this.createStudentProfile(user._id);
    }
    return this.createTutorProfile(user._id);
  }

  async createTutorProfile(userId: string): Promise<any> {
    return this.tutorProfileRepository.create({
      user_id: userId,
    });
  }

  async createStudentProfile(userId: string): Promise<any> {
    return this.studentProfileRepository.create({
      user_id: userId,
    });
  }
  // Get page tutor profile@Query('q') q?: string,
  async getTutorProfilePage(query: QueryOption, q?: string) {
    return this.tutorProfileRepository.getTutorProfilePage(query, q);
  }
  // FUCNTION
  async calcTutorProfileScore(userId: string, profile?: TutorProfile) {
    let tutorProfile: TutorProfile;
    if (!profile) {
      tutorProfile = await this.tutorProfileRepository.getOne({
        where: { user_id: userId },
        attributes: [
          'education_lever',
          'major',
          'experience_year',
          'certificate',
          'intro',
          'teaching_subject',
          'achievements',
        ],
      });
    } else {
      tutorProfile = profile;
    }
    if (!tutorProfile) {
      return;
    }
    let score = 0;
    if (tutorProfile.education_lever) score += 2;
    if (tutorProfile.major) score += 1;
    if (
      tutorProfile.experience_year &&
      tutorProfile.experience_year !== ExperienceYear.NONE
    )
      score += 2;
    if (tutorProfile.certificate && tutorProfile.certificate.length > 0) {
      score += Math.min(tutorProfile.certificate.length, 2);
    }
    if (tutorProfile.intro && tutorProfile.intro.length > 10) score += 2;
    if (
      tutorProfile.teaching_subject &&
      tutorProfile.teaching_subject.length > 0
    ) {
      score += Math.min(tutorProfile.teaching_subject.length, 2);
    }
    if (tutorProfile.achievements && tutorProfile.achievements.length > 0) {
      score += Math.min(tutorProfile.achievements.length, 5);
    }
    return score;
  }
}
