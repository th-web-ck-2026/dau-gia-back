import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClassService } from '../services/class.service';
import { Public } from '@Decorators/public.decorator';
import { CreateClassDto } from '../dto/create-class.dto';
import { Class } from '../entities/class.entity';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ReqUser } from '@/common/decorators/user.decorator';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { ConditionClassDto } from '../dto/condition-class.dto';

@Auth()
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}
  // API document
  @ApiOperation({ summary: 'Lấy các lớp học' })
  @Public()
  @Get()
  async findAll(
    @RequestCondition(ConditionClassDto) condition,
    @RequestQuery() query: QueryOption,
    @Query('q') q?: string,
  ) {
    return this.classService.getClass(condition, query, q);
  }
  // Tutor Manager class
  @ApiOperation({ summary: 'Lấy các lớp học của gia sư' })
  @Roles(UserRoles.TUTOR)
  @Get('tutor/manager')
  async getTutorClasses(@ReqUser() user) {
    return this.classService.tutorGetManagerClass(user.id);
  }
  @ApiOperation({ summary: 'Lấy các lớp học của học viên' })
  @Roles(UserRoles.STUDENT)
  @Get('student/manager')
  async getStudentClasses(@ReqUser() user) {
    return this.classService.studentGetClass(user.id);
  }
  // Student')
  // getClassByTutorId
  @ApiOperation({ summary: 'Lấy các lớp học của gia sư theo ID' })
  @Public()
  @Get('tutor/:tutorId')
  async getClassByTutorId(
    @Param('tutorId') tutorId: string,
    @RequestQuery() query,
  ) {
    return this.classService.getPage({ where: { tutor_id: tutorId } }, query);
  }
  @Get('tutor/:tutorId/total')
  async getTotalClassByTutorId(@Param('tutorId') tutorId: string) {
    return this.classService.count({ where: { tutor_id: tutorId } });
  }
  // Chú Ý Cái Này !!!!!!
  @ApiOperation({ summary: 'Lấy thông tin lớp học theo ID' })
  @Public()
  @Get(':id')
  async getClassById(@Param('id') id: string) {
    return this.classService.getClassById(id);
  }
  @ApiOperation({ summary: 'Gia sư mớ lớp học mới' })
  @Roles(UserRoles.TUTOR)
  @Post()
  async createClass(
    @ReqUser() user,
    @Body() classData: CreateClassDto,
  ): Promise<Class> {
    return this.classService.createClass(user, classData);
  }
  @ApiOperation({ summary: 'Gia sư cập nhật thông tin lớp học' })
  @Roles(UserRoles.TUTOR)
  @Put(':id')
  async updateClass(
    @ReqUser() user,
    @Param('id') id: string,
    @Body() classData: CreateClassDto,
  ): Promise<Class> {
    return this.classService.updateClass(user.id, id, classData);
  }
  @ApiOperation({ summary: 'Gia sư đóng lớp học' })
  @Roles(UserRoles.TUTOR)
  @Post(':id/close')
  async closeClass(@ReqUser() user, @Param('id') id: string): Promise<Class> {
    return this.classService.closeClass(user.id, id);
  }

  @ApiOperation({ summary: 'Gia sư xoá lớp học' })
  @Roles(UserRoles.TUTOR)
  @Delete(':id')
  async deleteClass(@ReqUser() user, @Param('id') id: string): Promise<Class> {
    return this.classService.deleteClass(user.id, id);
  }
}
