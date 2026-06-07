import { Controller, Get, Body, Put, Param, Query } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserAvatar } from '../dto/update-user-avatar.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ToChucProfileModel } from '@/modules/to-chuc-profile/models/to-chuc-profile.model';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '../common/constant';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionUserDto } from '../dto/condition-user.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';
import { ApiCondition, ApiGet } from '@/common/decorators/swagger';
import { User } from '../entities/user.entity';
@Auth()
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('info/:id')
  async getUserInfo(@Param('id') id: string) {
    return this.usersService.getOne({
      where: { _id: id },
      attributes: ['fullname'],
    });
  }

  @ApiOperation({ summary: 'Lấy thông tin của tôi' })
  @Get('me')
  async getProfileMe(@ReqUser() user) {
    // console.log('Full user object:', user);
    return this.usersService.getOne({
      where: { _id: user.id },
      include: [
        {
          model: ToChucProfileModel,
          as: 'toChucProfile',
          
        }
      ]
    });
  }
  @ApiOperation({ summary: 'Cập nhật thông tin của tôi' })
  @Put('me')
  async updateUserProfile(
    @ReqUser() user,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(user, updateUserProfileDto);
  }

  @ApiCondition({
    fields: [
      { name: '_id', type: 'string', description: 'Mã người dùng' },
      { name: 'email', type: 'string', description: 'Email' },
      { name: 'phone', type: 'string', description: 'Số điện thoại' },
      { name: 'fullname', type: 'string', description: 'Họ tên' },
      { name: 'role', type: 'string', description: 'Vai trò' },
      { name: 'userStatus', type: 'string', description: 'Trạng thái' },
      { name: 'userRoles', type: 'string', description: 'Loại người dùng' },
      { name: 'isVerified', type: 'boolean', description: 'Trạng thái xác minh' },
    ],
  })
  @ApiGet({
    mode: 'page',
    path: 'admin/page',
    summary: 'Admin lấy danh sách người dùng',
  })
  @Roles(UserRoles.ADMIN)
  async getPageAdmin(
    @RequestCondition(ConditionUserDto) condition: ConditionUserDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.usersService.getPageAdmin(condition, query);
  }

  @ApiOperation({ summary: 'Admin cập nhật thông tin người dùng' })
  @Roles(UserRoles.ADMIN)
  @Put('admin/:id')
  async updateUserByAdmin(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.usersService.updateUserByAdmin(id, updateUserAdminDto);
  }
}
