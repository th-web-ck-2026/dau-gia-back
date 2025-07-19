import { Injectable } from '@nestjs/common';
import { AdminService } from './admin.service';
import { fakerVI } from '@faker-js/faker';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UserRoles } from '@/modules/user/common/constant';
import { ClassMode, ClassStatus, PriceUnit } from '@/modules/class/common/constant';
import { User } from '@/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import { EducationLever, ExperienceYear } from '@/modules/profile/common/constant';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAiService {
  private openai: OpenAI;
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateClassDetails(topic: string): Promise<{ title: string; description: string; requirement: string }> {
    const prompt = `Tạo chi tiết cho một lớp học về chủ đề "${topic}". Chi tiết bao gồm:
    1.  Tiêu đề (title): Ngắn gọn, đơn giản, giống người tạo.
    2.  Mô tả (description): Chi tiết về nội dung lớp học, khoảng 2-3 câu.
    3.  Yêu cầu (requirement): Yêu cầu đối với học viên, 1-2 câu.

    Trả về kết quả dưới dạng JSON với các key: "title", "description", "requirement".`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async generateTutorProfile(topic: string): Promise<{ profile: string }> {
    const prompt = `Tạo một đoạn mô tả profile cho gia sư chuyên về "${topic}". Mô tả cần chuyên nghiệp, nêu bật kinh nghiệm và phương pháp giảng dạy. Độ dài khoảng 3-4 câu.

    Trả về kết quả dưới dạng JSON với key: "profile".`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async generateData() {
    // 1. Create users (tutors and students)
    const users = await this.createFakeUsers(10, 20);
    const tutors = users.filter((u) => u.role === UserRoles.TUTOR);
    const students = users.filter((u) => u.role === UserRoles.STUDENT);

    // 2. Tutors create classes
    const classes = await this.createFakeClasses(tutors);

    // 3. Students bid on classes
    await this.createFakeBids(students, classes);

    // 4. Auto-select bids (simple logic for now)
    // This part is complex and might need more business rules.
    // For now, I'll leave it out and focus on data generation.

    return {
      message: 'Fake data generated successfully.',
      data: {
        user_count: users.length,
        class_count: classes.length,
      },
    };
  }

  private async createFakeUsers(
    tutorCount: number,
    studentCount: number,
  ): Promise<User[]> {
    const tutorPromises = Array.from({ length: tutorCount }, async () => {
      const userDto = {
        fullname: fakerVI.person.fullName(),
        email: fakerVI.internet.email(),
        password: 'password123',
        role: UserRoles.TUTOR,
      };
      const user = await this.adminService.createUser(userDto as CreateUserDto);
      await this.adminService.createTutorProfile(user._id);
      const topic = fakerVI.helpers.arrayElement(['Toán', 'Lý', 'Hóa', 'Anh']);
      const { profile } = await this.generateTutorProfile(topic);
      const educationLever = fakerVI.helpers.arrayElement(Object.values(EducationLever));
      const experienceYear = fakerVI.helpers.arrayElement(Object.values(ExperienceYear));
      const major = fakerVI.helpers.arrayElement(['Sư phạm Toán', 'Sư phạm Lý', 'Sư phạm Hóa', 'Sư phạm Anh']);
      const teachingSubject = [topic];

      await this.adminService.updateTutorProfile(user._id, {
        intro: profile,
        education_lever: educationLever,
        major: major,
        experience_year: experienceYear,
        teaching_subject: teachingSubject,
      });
      return user;
    });

    const studentPromises = Array.from({ length: studentCount }, async () => {
      const userDto = {
        fullname: fakerVI.person.fullName(),
        email: fakerVI.internet.email(),
        password: 'password123',
        role: UserRoles.STUDENT,
      };
      const user = await this.adminService.createUser(userDto as CreateUserDto);
      return user;
    });

    const users = await Promise.all([...tutorPromises, ...studentPromises]);
    return users;
  }

  private async createFakeClasses(tutors: User[]): Promise<Class[]> {
    const classPromises = tutors.flatMap((tutor) => {
      const numberOfClasses = fakerVI.number.int({ min: 1, max: 3 });
      return Array.from({ length: numberOfClasses }, async () => {
        const subject = fakerVI.helpers.arrayElement(['Toán', 'Lý', 'Hóa', 'Anh']);
        const grade = fakerVI.helpers.arrayElement(['10', '11', '12']);
        const topic = `${subject} lớp ${grade}`;
        const aiDetails = await this.generateClassDetails(topic);

        const mode = fakerVI.helpers.arrayElement([
          ClassMode.ONLINE,
          ClassMode.OFFLINE,
        ]);
        let max_student;
        if (mode === ClassMode.OFFLINE) {
          max_student = 1;
        } else {
          max_student = fakerVI.number.int({ min: 5, max: 10 });
        }

        const price_min = Math.round(fakerVI.number.int({ min: 100, max: 500 }) * 1000 / 10) * 10;
        const price_max =
          Math.round((price_min + fakerVI.number.int({ min: 50, max: 200 }) * 1000) / 10) * 10;
        const classDto = {
          tutor_id: tutor._id,
          title: aiDetails.title,
          description: aiDetails.description,
          requirement: aiDetails.requirement,
          subject: subject,
          grade: grade,
          location: fakerVI.helpers.arrayElement([
            'Hà Nội',
            'Hải Phòng',
            'Thái Bình',
          ]),
          mode: mode,
          status: ClassStatus.OPEN,
          max_student: max_student,
          price_min: price_min,
          price_max: price_max,
          price_unit: fakerVI.helpers.arrayElement(Object.values(PriceUnit)),
          schedule: '2 buổi/tuần, tối thứ 3 và thứ 5',
        };
        return this.adminService.createClass(classDto as any);
      });
    });
    const classes = await Promise.all(classPromises);
    return classes;
  }

  private async createFakeBids(students: User[], classes: Class[]) {
    const bidPromises = students.flatMap((student) => {
      const classesToBid = fakerVI.helpers.arrayElements(classes, { min: 1, max: 3 });
      return classesToBid.map(async (aClass) => {
        const bidDto = {
          class_id: aClass._id,
          student_id: student._id,
          bid_price: Math.round(fakerVI.number.int({ min: aClass.price_min, max: aClass.price_max }) / 1000) * 1000,
          message: fakerVI.helpers.arrayElement([
            'Em rất muốn tham gia lớp học này để cải thiện kiến thức.',
            'Em hy vọng được học hỏi từ thầy/cô.',
            'Em cam kết sẽ học tập chăm chỉ nếu được nhận vào lớp.',
            'Lớp học này rất phù hợp với mục tiêu học tập của em.',
            'Em mong muốn được thầy/cô hướng dẫn để đạt kết quả tốt nhất.',
          ]),
        };
        try {
          await this.adminService.createBid(bidDto as any);
        } catch (error) {
          // Ignore error
        }
      });
    });
    await Promise.all(bidPromises);
  }
}
