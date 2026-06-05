import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DanhMucChungService } from '../services/danh-muc-chung.service';
import { CreateLoaiDanhMucDto } from '../dto/create-loai-danh-muc.dto';
import { UpdateLoaiDanhMucDto } from '../dto/update-loai-danh-muc.dto';
import { CreateDanhMucDto } from '../dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from '../dto/update-danh-muc.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UserRoles } from '@/modules/user/common/constant';
import { LoaiDanhMuc } from '../entities/loai-danh-muc.entity';
import { DanhMuc } from '../entities/danh-muc.entity';
import { PageableDto } from '@/common/dto/pageable.dto';
import { LoaiDanhMucModel } from '../models/loai-danh-muc.model';
import { ApiGet, ApiCondition } from '@/common/decorators/swagger';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { ConditionLoaiDanhMucDto } from '../dto/condition-loai-danh-muc.dto';
import { ConditionDanhMucDto } from '../dto/condition-danh-muc.dto';

@ApiTags('DanhMucChung')
@Controller('danh-muc-chung')
export class DanhMucChungController {
  constructor(private readonly danhMucChungService: DanhMucChungService) {}

  // === LoaiDanhMuc Endpoints ===

  @Post('loai')
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Tạo loại danh mục mới (Admin only)' })
  @ApiCreatedResponse({ type: LoaiDanhMuc })
  async createLoai(@Body() dto: CreateLoaiDanhMucDto): Promise<LoaiDanhMuc> {
    return this.danhMucChungService.createLoai(dto);
  }

  @ApiGet({
    mode: 'page',
    path: 'loai',
    summary: 'Lấy danh sách loại danh mục',
    responseType: LoaiDanhMuc,
  })
  @ApiCondition({
    fields: [
      { name: '_id', type: 'string', description: 'Mã ID loại danh mục' },
      { name: 'ten', type: 'string', description: 'Tên loại danh mục' },
      { name: 'ma', type: 'string', description: 'Mã loại danh mục' },
      { name: 'isDefault', type: 'boolean', description: 'Có phải mặc định không' },
    ],
  })
  @Public()
  async findAllLoai(
    @RequestCondition(ConditionLoaiDanhMucDto) condition: ConditionLoaiDanhMucDto,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<LoaiDanhMuc>> {
    return this.danhMucChungService.findAllLoai({ where: { ...condition } }, query);
  }

  @Get('loai/:id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết loại danh mục' })
  @ApiOkResponse({ type: LoaiDanhMuc })
  async findOneLoai(@Param('id') id: string): Promise<LoaiDanhMuc> {
    return this.danhMucChungService.findOneLoai(id);
  }

  @Patch('loai/:id')
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Cập nhật loại danh mục (Admin only)' })
  @ApiOkResponse({ type: LoaiDanhMuc })
  async updateLoai(
    @Param('id') id: string,
    @Body() dto: UpdateLoaiDanhMucDto,
  ): Promise<LoaiDanhMuc> {
    return this.danhMucChungService.updateLoai(id, dto);
  }

  @Delete('loai/:id')
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Xóa loại danh mục (Admin only)' })
  @ApiOkResponse({ type: LoaiDanhMuc })
  async removeLoai(@Param('id') id: string): Promise<LoaiDanhMuc> {
    return this.danhMucChungService.removeLoai(id);
  }

  // === DanhMuc Endpoints ===

  @Post()
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Tạo danh mục mới (Admin only)' })
  @ApiCreatedResponse({ type: DanhMuc })
  async createDanhMuc(@Body() dto: CreateDanhMucDto): Promise<DanhMuc> {
    return this.danhMucChungService.createDanhMuc(dto);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Lấy danh sách danh mục',
    responseType: DanhMuc,
  })
  @ApiCondition({
    fields: [
      { name: '_id', type: 'string', description: 'Mã ID danh mục' },
      { name: 'ten', type: 'string', description: 'Tên danh mục' },
      { name: 'maLoai', type: 'string', description: 'Mã loại danh mục' },
    ],
  })
  @Public()
  async findAllDanhMuc(
    @RequestCondition(ConditionDanhMucDto) condition: ConditionDanhMucDto,
    @RequestQuery() query: QueryOption,
    @Query('maLoai') maLoai?: string,
  ): Promise<PageableDto<DanhMuc>> {
    const whereCondition: any = { ...condition };
    if (maLoai) {
      whereCondition.maLoai = maLoai;
    }
    return this.danhMucChungService.findAllDanhMuc(
      {
        where: whereCondition,
        include: [{ model: LoaiDanhMucModel, as: 'loaiDanhMuc', attributes: ['_id', 'ma', 'ten', 'isDefault'] }],
      },
      query,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  @ApiOkResponse({ type: DanhMuc })
  async findOneDanhMuc(@Param('id') id: string): Promise<DanhMuc> {
    return this.danhMucChungService.findOneDanhMuc(id);
  }

  @Patch(':id')
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Cập nhật danh mục (Admin only)' })
  @ApiOkResponse({ type: DanhMuc })
  async updateDanhMuc(
    @Param('id') id: string,
    @Body() dto: UpdateDanhMucDto,
  ): Promise<DanhMuc> {
    return this.danhMucChungService.updateDanhMuc(id, dto);
  }

  @Delete(':id')
  @Auth(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Xóa danh mục (Admin only)' })
  @ApiOkResponse({ type: DanhMuc })
  async removeDanhMuc(@Param('id') id: string): Promise<DanhMuc> {
    return this.danhMucChungService.removeDanhMuc(id);
  }
}
