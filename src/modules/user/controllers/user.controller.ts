import { Controller, Get, Body, Put, Param } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserAvatar } from '../dto/update-user-avatar.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
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
  @Get('profile/me')
  async getProfileMe(@ReqUser() user) {
    console.log('Full user object:', user);
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
  @Put('profile/me')
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

  @ApiOperation({ summary: 'Cập nhật avatar của tôi' })
  @Put('avatar/me')
  async updateAvatar(
    @ReqUser() user,
    @Body() updateUserAvatar: UpdateUserAvatar,
  ) {
    return this.usersService.updateUserAvatar(user.id, updateUserAvatar.avatar);
  }
}
