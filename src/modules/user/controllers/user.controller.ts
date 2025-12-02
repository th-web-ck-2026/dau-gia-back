import { Controller, Get, Body, Put, Param, Query } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserAvatar } from '../dto/update-user-avatar.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { ConditionUserDto } from '../dto/condition-user.dto';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
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
      attributes: [
        '_id',
        'fullname',
        'email',
        'phone',
        'role',
        'avatar',
        'birthday',
        'address',
        'gender',
      ],
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

  @ApiOperation({ summary: 'Cập nhật mật khẩu của tôi' })
  @Put('password/me')
  async updatePassword(
    @ReqUser() user,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword(user.id, updateUserPasswordDto);
  }

  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @Get('page')
  async getDanhSachNguoiDung(
    @ReqUser() user,
    @Query('search') search: string,
    @RequestQuery() query: QueryOption,
  ) {
    return this.usersService.getDanhSachNguoiDung(user, search, query);
  }
}
