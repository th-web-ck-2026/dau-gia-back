import { Injectable } from '@nestjs/common';
import { AdminService } from './admin.service';
import { fakerVI } from '@faker-js/faker';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { AdminFlowService } from './admin-flow.service';
import { BidRepository } from '@/modules/bid/repositories/bid.repository';
import { EnrollmentRepository } from '@/modules/enrollment/repositories/enrollment.repository';
import { EnrollmentStatus } from '@/modules/enrollment/common/constant';
import { UserRoles } from '@/modules/user/common/constant';
import {
  ClassMode,
  ClassStatus,
  PriceUnit,
} from '@/modules/class/common/constant';
import { User } from '@/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import {
  EducationLever,
  ExperienceYear,
} from '@/modules/profile/common/constant';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAiService {
  private openai: OpenAI;
  constructor(
    private readonly adminService: AdminService,
    private readonly adminFlowService: AdminFlowService,
    private readonly bidRepository: BidRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFullFlow(quantity: number) {
    const adminUser = {
      id: '66989fb0f02e38a4243ab562',
      email: 'admin@gmail.com',
      fullname: 'Admin',
      phone: '123456789',
      role: UserRoles.ADMIN,
      comparePassword: async (password: string) => true,
    };

    const flowPromises = Array.from({ length: quantity }, async () => {
      // 1. Create 1 tutor and 2 students in parallel
      const [tutor, student1, student2, student3] = await Promise.all([
        this.createSingleUser(UserRoles.TUTOR),
        this.createSingleUser(UserRoles.STUDENT),
        this.createSingleUser(UserRoles.STUDENT),
        this.createSingleUser(UserRoles.STUDENT),
      ]);
      const students = [student1, student2, student3];

      // 2. Tutor creates 3-4 classes in parallel
      const numberOfClasses = fakerVI.number.int({ min: 3, max: 4 });
      const classes = await Promise.all(
        Array.from({ length: numberOfClasses }, () =>
          this.createSingleClass(tutor),
        ),
      );

      const classFlowPromises = classes.map(async (aClass) => {
        // Process each class flow: students bid, tutor selects, student enrolls, admin creates review
        return this.processClassFlow(adminUser, tutor, students, aClass);
      });
      return Promise.all(classFlowPromises.filter(Boolean)); // Filter out nulls
    });

    const allResults = await Promise.all(flowPromises);
    const results = allResults.flat(); // Flatten the array of arrays

    return {
      message: `AI-generated flow completed successfully for ${quantity} iterations.`,
      data: results,
    };
  }

  async generateClassDetails(
    topic: string,
  ): Promise<{ title: string; description: string; requirement: string }> {
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

  async generateReviewContent(
    className: string,
    rating: number,
  ): Promise<{ comment: string }> {
    const prompt = `Viết một đánh giá ngắn gọn (1-2 câu) từ góc nhìn của một học sinh cho lớp học "${className}" với mức đánh giá ${rating}/5 sao.
    Nội dung cần phản ánh sự hài lòng của học sinh.

    Trả về kết quả dưới dạng JSON với key: "comment".`;

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

  private async createSingleUser(role: UserRoles): Promise<User> {
    const userDto = {
      fullname: fakerVI.person.fullName(),
      email: fakerVI.internet.email(),
      password: 'password123',
      role: role,
    };
    const user = await this.adminService.createUser(userDto as CreateUserDto);

    if (role === UserRoles.TUTOR) {
      await this.adminService.createTutorProfile(user._id);
      const topic = fakerVI.helpers.arrayElement([
        'Toán',
        'Vật lý',
        'Hoá học',
        'Tiếng Anh',
      ]);
      const { profile } = await this.generateTutorProfile(topic);
      const educationLever = fakerVI.helpers.arrayElement(
        Object.values(EducationLever),
      );
      const experienceYear = fakerVI.helpers.arrayElement(
        Object.values(ExperienceYear),
      );
      const major = fakerVI.helpers.arrayElement([
        'Sư phạm Toán',
        'Sư phạm Lý',
        'Sư phạm Hóa',
        'Sư phạm Anh',
      ]);
      const teachingSubject = [topic];

      await this.adminService.updateTutorProfile(user._id, {
        intro: profile,
        education_lever: educationLever,
        major: major,
        experience_year: experienceYear,
        teaching_subject: teachingSubject,
      });
    }
    return user;
  }

  private async createSingleClass(tutor: User): Promise<Class> {
    const subject = fakerVI.helpers.arrayElement(['Toán', 'Vật lý', 'Hoá Học', 'Tiếng Anh']);
    const grade = fakerVI.helpers.arrayElement(['10', '11', '12']);
    const topic = `${subject} lớp ${grade}`;
    const aiDetails = await this.generateClassDetails(topic);

    const mode = ClassMode.OFFLINE;
    const max_student = 1;

    const price_min =
      Math.round((fakerVI.number.int({ min: 1, max: 2 }) * 100000) / 50000) *
      50000;
    const price_max =
      Math.round(
        (price_min + fakerVI.number.int({ min: 1, max: 2 }) * 100000) / 50000,
      ) * 50000;
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
      schedule: fakerVI.helpers.arrayElement([
        '2 buổi/tuần, tối thứ 3 và thứ 5',
        '3 buổi/tuần, sáng thứ 2, thứ 4, thứ 6',
        '1 buổi/tuần, chiều thứ 7',
        '4 buổi/tuần, các buổi tối từ thứ 2 đến thứ 5',
        '5 buổi/tuần, học từ thứ 2 đến thứ 6, buổi chiều',
        '3 buổi/tuần, tối thứ 2, thứ 4 và thứ 7',
        '2 buổi/tuần, sáng thứ 7 và chủ nhật',
        '6 buổi/tuần, từ thứ 2 đến thứ 7 vào buổi sáng',
        '1 buổi/tuần, tối chủ nhật',
        'Học cả ngày thứ 7 và sáng chủ nhật',
        '3 buổi/tuần, học vào các buổi tối xen kẽ trong tuần',
        'Học linh hoạt theo lịch của học viên (cần trao đổi thêm)',
        '2 buổi/tuần, trưa thứ 2 và thứ 5',
        '4 buổi/tuần, từ thứ 2 đến thứ 5 vào lúc 19h – 20h30',
        '3 buổi/tuần, chiều thứ 3, thứ 5 và thứ 7',
      ]),
    };
    return this.adminService.createClass(classDto as any);
  }

  private async createSingleBid(student: User, aClass: Class) {
    const bidDto = {
      class_id: aClass._id,
      student_id: student._id,
      bid_price:
        Math.round(
          fakerVI.number.int({ min: aClass.price_min, max: aClass.price_max }) /
            50000,
        ) * 50000,
      message: fakerVI.helpers.arrayElement([
        'Em rất muốn tham gia lớp học này để cải thiện kiến thức.',
        'Em hy vọng được học hỏi từ thầy/cô.',
        'Em cam kết sẽ học tập chăm chỉ nếu được nhận vào lớp.',
        'Em tin rằng lớp học của thầy/cô sẽ giúp em tiến bộ nhanh chóng.',
        'Em thực sự quan tâm đến môn học này và mong được thầy/cô hướng dẫn.',
        'Em mong muốn được trau dồi kiến thức cùng với sự hỗ trợ của thầy/cô.',
        'Em sẽ cố gắng hết mình nếu có cơ hội học lớp này.',
        'Em đã tìm hiểu và rất phù hợp với phương pháp giảng dạy của thầy/cô.',
        'Em luôn có tinh thần cầu tiến và muốn cải thiện kỹ năng qua lớp học này.',
        'Em mong nhận được cơ hội để học hỏi và rèn luyện cùng thầy/cô.',
        'Lớp học này rất phù hợp với nhu cầu học tập hiện tại của em.',
        'Em sẽ nỗ lực hết sức để không phụ lòng tin của thầy/cô.',
        'Em đã chuẩn bị sẵn sàng để bắt đầu quá trình học tập nghiêm túc.',
        'Em tin rằng thầy/cô sẽ giúp em đạt được mục tiêu học tập đề ra.',
        'Em rất háo hức được học cùng một người có kinh nghiệm như thầy/cô.',
      ]),
    };
    return this.adminService.createBid(bidDto as any);
  }

  private async createFakeUsers(
    tutorCount: number,
    studentCount: number,
  ): Promise<User[]> {
    const tutorPromises = Array.from({ length: tutorCount }, async () => {
      return this.createSingleUser(UserRoles.TUTOR);
    });

    const studentPromises = Array.from({ length: studentCount }, async () => {
      return this.createSingleUser(UserRoles.STUDENT);
    });

    const users = await Promise.all([...tutorPromises, ...studentPromises]);
    return users;
  }

  private async createFakeClasses(tutors: User[]): Promise<Class[]> {
    const classPromises = tutors.flatMap((tutor) => {
      const numberOfClasses = fakerVI.number.int({ min: 1, max: 3 });
      return Array.from({ length: numberOfClasses }, async () => {
        const subject = fakerVI.helpers.arrayElement([
          'Toán',
          'Lý',
          'Hóa',
          'Anh',
        ]);
        const grade = fakerVI.helpers.arrayElement(['10', '11', '12']);
        const topic = `${subject} lớp ${grade}`;
        const aiDetails = await this.generateClassDetails(topic);

        const mode = ClassMode.OFFLINE;
        const max_student = 1;

        const price_min =
          Math.round(
            (fakerVI.number.int({ min: 1, max: 5 }) * 100000) / 50000,
          ) * 50000;
        const price_max =
          Math.round(
            (price_min + fakerVI.number.int({ min: 1, max: 2 }) * 100000) /
              50000,
          ) * 50000;
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
          schedule: fakerVI.helpers.arrayElement([
            '2 buổi/tuần, tối thứ 3 và thứ 5',
            '3 buổi/tuần, sáng thứ 2, thứ 4, thứ 6',
            '1 buổi/tuần, chiều thứ 7',
            '4 buổi/tuần, các buổi tối từ thứ 2 đến thứ 5',
          ]),
        };
        return this.adminService.createClass(classDto as any);
      });
    });
    const classes = await Promise.all(classPromises);
    return classes;
  }

  private async createFakeBids(students: User[], classes: Class[]) {
    const bidPromises = students.flatMap((student) => {
      const classesToBid = fakerVI.helpers.arrayElements(classes, {
        min: 1,
        max: 3,
      });
      return classesToBid.map(async (aClass) => {
        const bidDto = {
          class_id: aClass._id,
          student_id: student._id,
          bid_price:
            Math.round(
              fakerVI.number.int({
                min: aClass.price_min,
                max: aClass.price_max,
              }) / 50000,
            ) * 50000,
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

  private async processClassFlow(
    adminUser: any,
    tutor: User,
    students: User[],
    aClass: Class,
  ) {
    // 3. 2-4 students bid on each class in parallel
    const studentsToBid = fakerVI.helpers.arrayElements(students, {
      min: 2,
      max: 4,
    });
    const bids = await Promise.all(
      studentsToBid.map((student) => this.createSingleBid(student, aClass)),
    );

    // 4. Tutor selects 1 student (randomly from bids)
    if (bids.length > 0) {
      const selectedBid = fakerVI.helpers.arrayElement(bids);
      const selectedStudent = students.find(
        (s) => s._id === selectedBid.student_id,
      );

      await this.adminFlowService.adminSelectStudent(
        adminUser,
        tutor._id,
        selectedBid._id,
      );

      // 5. Selected student confirms enrollment
      await this.adminFlowService.adminCompleteEnrollment(
        adminUser,
        selectedStudent._id,
        aClass._id,
      );

      // Add a small delay to ensure database consistency before creating the review
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

      // 6. Admin creates a review for the selected student
      const rating = fakerVI.number.int({ min: 4, max: 5 });
      const { comment } = await this.generateReviewContent(
        aClass.title,
        rating,
      );

      const reviewDto = {
        classId: aClass._id,
        studentId: selectedStudent._id,
        rating,
        comment,
      };
      await this.adminFlowService.adminCreateReview(
        adminUser,
        reviewDto as any,
      );

      return {
        tutor: tutor.email,
        selectedStudent: selectedStudent.email,
        class: aClass.title,
        rating: rating,
        comment: comment,
      };
    }
    return null; // In case no bids are created
  }
}
