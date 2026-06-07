import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaoCaoUserService } from '../services/bao-cao-user.service';
import { CreateBaoCaoUserDto } from '../dto/create-bao-cao-user.dto';
import { ConditionBaoCaoUserDto } from '../dto/condition-bao-cao-user.dto';
import { ReplyBaoCaoUserDto } from '../dto/reply-bao-cao-user.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UserRoles } from '@/modules/user/common/constant';

@ApiTags('Báo cáo người dùng')
@Auth()
@Controller('bao-cao-user')
export class BaoCaoUserController {
  constructor(private readonly baoCaoUserService: BaoCaoUserService) {}

  @ApiOperation({ summary: 'Người dùng gửi báo cáo một người dùng khác' })
  @Post()
  async taoBaoCao(
    @ReqUser() user: AuthUser,
    @Body() dto: CreateBaoCaoUserDto,
  ) {
    return this.baoCaoUserService.taoBaoCao(user, dto);
  }

  @ApiOperation({ summary: 'Danh sách báo cáo do tôi gửi' })
  @Get('me')
  async getPageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionBaoCaoUserDto) condition: ConditionBaoCaoUserDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.baoCaoUserService.getPageMe(user.id, condition, query);
  }

  @ApiOperation({ summary: 'Admin xem và lọc danh sách báo cáo' })
  @Auth(UserRoles.ADMIN)
  @Get('admin')
  async getPageAdmin(
    @RequestCondition(ConditionBaoCaoUserDto) condition: ConditionBaoCaoUserDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.baoCaoUserService.getPageAdmin(condition, query);
  }

  @ApiOperation({ summary: 'Admin xem chi tiết một báo cáo' })
  @Auth(UserRoles.ADMIN)
  @Get('admin/:id')
  async getById(@Param('id') id: string) {
    return this.baoCaoUserService.getById(id);
  }

  @ApiOperation({ summary: 'Admin trả lời báo cáo (đánh dấu đã xử lý)' })
  @Auth(UserRoles.ADMIN)
  @Put('admin/:id/tra-loi')
  async traLoiBaoCao(
    @ReqUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReplyBaoCaoUserDto,
  ) {
    return this.baoCaoUserService.traLoiBaoCao(admin.id, id, dto);
  }
}
