import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { HoaDonChoThueService } from '../services/hoa-don.cho-thue.service';
import { ApiTags } from '@nestjs/swagger';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionHoaDonDto } from '../dto/condition-hoa-don.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { CreateHoaDonDto } from '../dto/create-hoa-don.dto';
import { UpdateHoaDonDto } from '../dto/update-hoa-don.dto';
import { ThanhToanHoaDonChoThueDto } from '../dto/update-trang-thai-thanh-toan-hoa-don.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';

@Auth(UserRoles.USER)
@Controller('hoa-don/cho-thue')
@ApiTags('Hoa Don Cho Thue')
export class HoaDonChoThueController {
  constructor(private readonly hoaDonChoThueService: HoaDonChoThueService) {}
  @Get('me/page')
  async getHoaDonChoThuePageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionHoaDonDto) condition: ConditionHoaDonDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.hoaDonChoThueService.getHoaDonChoThuePageMe(
      user,
      condition,
      query,
    );
  }
  @Get('me/:id')
  async getHoaDonChoThueByIdMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.hoaDonChoThueService.getOne({
      where: { _id: id, userId: user.id },
      include: [
        {
          model: HopDongThueModel,
        },
      ],
    });
  }
  @Post('me')
  async createHoaDonChoThueMe(
    @ReqUser() user: AuthUser,
    @Body() createHoaDonChoThueDto: CreateHoaDonDto,
  ) {
    return this.hoaDonChoThueService.createHoaDonChoThue(
      user,
      createHoaDonChoThueDto,
    );
  }
  @Put('me/:id')
  async updateHoaDonChoThueMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateHoaDonChoThueDto: UpdateHoaDonDto,
  ) {
    return this.hoaDonChoThueService.updateOne(updateHoaDonChoThueDto, {
      where: { _id: id, userId: user.id },
    });
  }
  @Put('me/:id/thanh-toan')
  async thanhToanHoaDonChoThueMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() thanhToanHoaDonChoThueDto: ThanhToanHoaDonChoThueDto,
  ) {
    return this.hoaDonChoThueService.updateTrangThaiThanhToanHoaDonChoThue(
      user,
      id,
      thanhToanHoaDonChoThueDto.trangThai,
    );
  }
}
