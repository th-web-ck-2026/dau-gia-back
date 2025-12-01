import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Put,
  Param,
} from '@nestjs/common';
import { ThongTinThanhToanService } from '../services/thong-tin-thanh-toan.service';
import { CreateThongTinThanhToanDto } from '../dto/create-thong-tin-thanh-toan.dto';
import { UpdateThongTinThanhToanDto } from '../dto/update-thong-tin-thanh-toan.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ReqUser } from '@/common/decorators/user.decorator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UserRoles } from '@/modules/user/common/constant';

@Auth(UserRoles.USER)
@Controller('thong-tin-thanh-toan')
export class ThongTinThanhToanController {
  constructor(
    private readonly thongTinThanhToanService: ThongTinThanhToanService,
  ) {}

  @Post('me')
  async createThongTinThanhToan(
    @ReqUser() user: AuthUser,
    @Body() createThongTinThanhToanDto: CreateThongTinThanhToanDto,
  ) {
    return this.thongTinThanhToanService.create({
      ...createThongTinThanhToanDto,
      userId: user.id,
    });
  }
  @Get('me/:id')
  async getThongTinThanhToanById(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.thongTinThanhToanService.getOne({
      where: { _id: id, userId: user.id },
    });
  }
  @Put('me/:id')
  async updateThongTinThanhToan(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateThongTinThanhToanDto: UpdateThongTinThanhToanDto,
  ) {
    return this.thongTinThanhToanService.updateOne(updateThongTinThanhToanDto, {
      where: { _id: id, userId: user.id },
    });
  }
  // getmePage
  @Get('me/page')
  async getThongTinThanhToanPage(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.thongTinThanhToanService.getPage(
      {
        where: { userId: user.id },
      },
      query,
    );
  }
}
