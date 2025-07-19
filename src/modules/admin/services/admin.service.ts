import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRoles } from '@/modules/user/common/constant';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/user/services/user.service';
import { ClassService } from '@/modules/class/services/class.service';
import { BidService } from '@/modules/bid/services/bid.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { CreateClassDto } from '@/modules/class/dto/create-class.dto';
import { CreateBidDto } from '@/modules/bid/dto/create-bid.dto';
import { User } from '@/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import { Bid } from '@/modules/bid/entities/bid.entity';
import { UpdateUserProfileDto } from '@/modules/user/dto/update-user-profile.dto';
import { UpdateClassDto } from '@/modules/class/dto/update-class.dto';
import { UpdateBidDto } from '@/modules/bid/dto/update-bid.dto';
import { ProfileService } from '@/modules/profile/services/profile.service';
import { AuthService } from '@/modules/auth/services/auth.service';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly userService: UsersService,
    private readonly classService: ClassService,
    private readonly bidService: BidService,
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  async getAllUsers() {
    return this.userService.getMany();
  }

  async getUserById(id: string): Promise<User> {
    return this.userService.getById(id);
  }

  async updateUser(id: string, updateUserDto: UpdateUserProfileDto) {
    return this.userService.updateOne(updateUserDto, { where: { _id: id } });
  }

  async deleteUser(id: string) {
    return this.userService.deleteOne(id);
  }

  async createClass(createClassDto: CreateClassDto): Promise<Class> {
    return this.classService.create(createClassDto);
  }

  async getAllClasses() {
    return this.classService.getMany();
  }

  async getClassById(id: string): Promise<Class> {
    return this.classService.getById(id);
  }

  async updateClass(id: string, updateClassDto: UpdateClassDto) {
    return this.classService.updateOne(updateClassDto, { where: { _id: id } });
  }

  async deleteClass(id: string) {
    return this.classService.deleteOne(id);
  }

  async createBid(createBidDto: CreateBidDto): Promise<Bid> {
    return this.bidService.create(createBidDto);
  }

  async getAllBids() {
    return this.bidService.getMany();
  }

  async getBidById(id: string): Promise<Bid> {
    return this.bidService.getById(id);
  }

  async updateBid(id: string, updateBidDto: UpdateBidDto) {
    return this.bidService.updateOne(updateBidDto, { where: { _id: id } });
  }

  async deleteBid(id: string) {
    return this.bidService.deleteOne(id);
  }

  async createTutorProfile(userId: string) {
    return this.profileService.createTutorProfile(userId);
  }

  async updateTutorProfile(userId: string, dto: any) {
    return this.profileService.updateTutorProfile(userId, dto);
  }

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const adminExists = await this.userService.getOne({
      where: { email: adminEmail, role: UserRoles.ADMIN },
    });

    if (!adminExists) {
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await this.userService.create({
          phone: '0000000000',
          email: adminEmail,
          password: hashedPassword,
          role: UserRoles.ADMIN,
          fullname: 'Admin',
        });
        console.log('Admin user created successfully.');
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.warn(
            'Could not create admin user. A user with the phone number 0000000000 already exists.',
          );
        } else {
          throw error;
        }
      }
    }
  }
}
