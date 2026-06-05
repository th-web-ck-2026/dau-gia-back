import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { LoaiDanhMuc } from '../entities/loai-danh-muc.entity';
import { DanhMuc } from '../entities/danh-muc.entity';
import { LoaiDanhMucRepository } from '../repositories/loai-danh-muc.repository';
import { DanhMucRepository } from '../repositories/danh-muc.repository';
import { CreateLoaiDanhMucDto } from '../dto/create-loai-danh-muc.dto';
import { UpdateLoaiDanhMucDto } from '../dto/update-loai-danh-muc.dto';
import { CreateDanhMucDto } from '../dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from '../dto/update-danh-muc.dto';
import { FindOptions } from 'sequelize';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';

@Injectable()
export class DanhMucChungService extends BaseService<LoaiDanhMuc> implements OnModuleInit {
  constructor(
    private readonly loaiDanhMucRepository: LoaiDanhMucRepository,
    private readonly danhMucRepository: DanhMucRepository,
  ) {
    super(loaiDanhMucRepository);
  }

  async onModuleInit() {
    try {
      const defaultTypes = [
        { ma: 'LINH_VUC_DAU_GIA', ten: 'Lĩnh vực đấu giá', isDefault: true },
        { ma: 'LOAI_TAI_SAN', ten: 'Loại tài sản', isDefault: true },
      ];

      for (const type of defaultTypes) {
        const existing = await this.loaiDanhMucRepository.getOne({
          where: { ma: type.ma },
        });
        if (!existing) {
          await this.loaiDanhMucRepository.create(type);
          console.log(`[DanhMucChung] Seeded default type: ${type.ma}`);
        }
      }
    } catch (error) {
      console.error('[DanhMucChung] Failed to seed default types:', error);
    }
  }

  // === CRUD LoaiDanhMuc ===

  async createLoai(dto: CreateLoaiDanhMucDto): Promise<LoaiDanhMuc> {
    const existing = await this.loaiDanhMucRepository.getOne({
      where: { ma: dto.ma },
    });
    if (existing) {
      throw new BadRequestException('Mã loại danh mục đã tồn tại');
    }
    return this.loaiDanhMucRepository.create({
      ...dto,
      isDefault: false,
    });
  }

  async findAllLoai(condition: FindOptions = {}, query: QueryOption = {}): Promise<PageableDto<LoaiDanhMuc>> {
    return this.loaiDanhMucRepository.getPage(condition, query);
  }

  async findOneLoai(id: string): Promise<LoaiDanhMuc> {
    const item = await this.loaiDanhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy loại danh mục');
    }
    return item;
  }

  async updateLoai(id: string, dto: UpdateLoaiDanhMucDto): Promise<LoaiDanhMuc> {
    const item = await this.loaiDanhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy loại danh mục');
    }

    if (dto.ma && dto.ma !== item.ma) {
      const existing = await this.loaiDanhMucRepository.getOne({
        where: { ma: dto.ma },
      });
      if (existing) {
        throw new BadRequestException('Mã loại danh mục đã tồn tại');
      }
    }

    await this.loaiDanhMucRepository.updateOne(dto, {
      where: { _id: id },
    });

    return this.loaiDanhMucRepository.getById(id);
  }

  async removeLoai(id: string): Promise<LoaiDanhMuc> {
    const item = await this.loaiDanhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy loại danh mục');
    }

    if (item.isDefault) {
      throw new BadRequestException('Không thể xóa loại danh mục mặc định');
    }

    // Cascade delete related DanhMuc entries
    await this.danhMucRepository.deleteMany({
      where: { maLoai: item.ma },
    });

    await this.loaiDanhMucRepository.deleteOne({
      where: { _id: id },
    });

    return item;
  }

  // === CRUD DanhMuc ===

  async createDanhMuc(dto: CreateDanhMucDto): Promise<DanhMuc> {
    const loai = await this.loaiDanhMucRepository.getOne({
      where: { ma: dto.maLoai },
    });
    if (!loai) {
      throw new BadRequestException('Mã loại danh mục không tồn tại');
    }

    return this.danhMucRepository.create(dto);
  }

  async findAllDanhMuc(condition: FindOptions = {}, query: QueryOption = {}): Promise<PageableDto<DanhMuc>> {
    return this.danhMucRepository.getPage(condition, query);
  }

  async findOneDanhMuc(id: string): Promise<DanhMuc> {
    const item = await this.danhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return item;
  }

  async updateDanhMuc(id: string, dto: UpdateDanhMucDto): Promise<DanhMuc> {
    const item = await this.danhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (dto.maLoai) {
      const loai = await this.loaiDanhMucRepository.getOne({
        where: { ma: dto.maLoai },
      });
      if (!loai) {
        throw new BadRequestException('Mã loại danh mục không tồn tại');
      }
    }

    await this.danhMucRepository.updateOne(dto, {
      where: { _id: id },
    });

    return this.danhMucRepository.getById(id);
  }

  async removeDanhMuc(id: string): Promise<DanhMuc> {
    const item = await this.danhMucRepository.getById(id);
    if (!item) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    await this.danhMucRepository.deleteOne({
      where: { _id: id },
    });

    return item;
  }
}
