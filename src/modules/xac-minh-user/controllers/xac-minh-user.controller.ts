import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { XacMinhUserService } from '../services/xac-minh-user.service';
import { CreateXacMinhUserDto } from '../dto/create-xac-minh-user.dto';
import { UpdateXacMinhUserDto } from '../dto/update-xac-minh-user.dto';
import { AdminDuyetDonXacMinhDto } from '../dto/admin-duyet.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@Interfaces/auth-user.interface';
import { User } from '@/modules/user/entities/user.entity';
import { UserRoles } from '@/modules/user/common/constant';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { XacMinhUser } from '../entities/xac-minh-user.entity';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserModel } from '@/modules/user/models/user.model';
import { ApiGet } from '@/common/decorators/swagger';

@ApiTags('XacMinhUser')
@Auth()
@Controller('xac-minh-user')
export class XacMinhUserController {
  constructor(private readonly xacMinhUserService: XacMinhUserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin yêu cầu xác minh của tôi' })
  @ApiOkResponse({ type: XacMinhUser })
  async getMe(@ReqUser() user: AuthUser) {
    return this.xacMinhUserService.getMe({ _id: user.id } as User);
  }

  @Post('me')
  @ApiOperation({ summary: 'Tạo yêu cầu xác minh cho tôi' })
  @ApiCreatedResponse({ type: XacMinhUser })
  async createMe(@ReqUser() user: AuthUser, @Body() dto: CreateXacMinhUserDto) {
    return this.xacMinhUserService.createMe({ _id: user.id } as User, dto);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Admin lấy danh sách yêu cầu xác minh',
  })
  @Get('admin/page')
  @Roles(UserRoles.ADMIN)
  async getDanhSach(
    @RequestCondition(XacMinhUser) condition: XacMinhUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.xacMinhUserService.getPage(
      {
        where: { ...condition },
        include: [
          {
            model: UserModel,
            as: 'user',
          },
        ],
      },
      query,
    );
  }

  @Post('admin/:id/duyet')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Admin duyệt hoặc từ chối đơn xác minh' })
  @ApiOkResponse({ type: XacMinhUser })
  async adminDuyetDon(
    @Param('id') id: string,
    @Body() dto: AdminDuyetDonXacMinhDto,
  ) {
    return this.xacMinhUserService.adminDuyetDon(id, dto);
  }
}
