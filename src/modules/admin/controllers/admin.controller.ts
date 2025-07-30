import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { UserRoles } from '@/modules/user/common/constant';
import { Auth } from '@/common/decorators/auth.decorator';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UpdateUserProfileDto } from '@/modules/user/dto/update-user-profile.dto';
import { CreateClassDto } from '@/modules/class/dto/create-class.dto';
import { UpdateClassDto } from '@/modules/class/dto/update-class.dto';
import { CreateBidDto } from '@/modules/bid/dto/create-bid.dto';
import { UpdateBidDto } from '@/modules/bid/dto/update-bid.dto';
import { AdminAiService } from '../services/admin-ai.service';

@Auth(UserRoles.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminAiService: AdminAiService,
  ) {}

  // AI Endpoints
  @Post('ai/generate-data')
  generateData() {
    return this.adminAiService.generateData();
  }

  // User Management
  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserProfileDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Class Management
  @Post('classes')
  createClass(@Body() createClassDto: CreateClassDto) {
    return this.adminService.createClass(createClassDto);
  }

  @Get('classes')
  getAllClasses() {
    return this.adminService.getAllClasses();
  }

  @Get('classes/:id')
  getClassById(@Param('id') id: string) {
    return this.adminService.getClassById(id);
  }

  @Patch('classes/:id')
  updateClass(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.adminService.updateClass(id, updateClassDto);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(id);
  }

  // Bid Management
  @Post('bids')
  createBid(@Body() createBidDto: CreateBidDto) {
    return this.adminService.createBid(createBidDto);
  }

  @Get('bids')
  getAllBids() {
    return this.adminService.getAllBids();
  }

  @Get('bids/:id')
  getBidById(@Param('id') id: string) {
    return this.adminService.getBidById(id);
  }

  @Patch('bids/:id')
  updateBid(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.adminService.updateBid(id, updateBidDto);
  }

  @Delete('bids/:id')
  deleteBid(@Param('id') id: string) {
    return this.adminService.deleteBid(id);
  }
}
