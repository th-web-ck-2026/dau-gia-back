import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { HopDongThue } from '../entities/hop-dong-thue.entity';
import { HopDongThueRepository } from '../repositories/hop-dong-thue.repository';
import { CreateHopDongThueDto } from '../dto/create-hop-dong-thue.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { UnitService } from '@/modules/unit/services/unit.service';
import { UsersService } from '@/modules/user/services/user.service';
import { ApiError } from '@/common/exceptions/api-error';
import { UnitTrangThaiThue } from '@/modules/unit/common/constant';
import { TenantChoThueService } from '@/modules/tenant/services/tenant.cho-thue.service';
import { HopDongTrangThai } from '../common/constant';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class HopDongThueService extends BaseService<HopDongThue> {
  constructor(
    private readonly hopDongThueRepository: HopDongThueRepository,
    private readonly unitService: UnitService,
    private readonly usersService: UsersService,
    private readonly tenantChoThueService: TenantChoThueService,
    private readonly sequelize: Sequelize,
  ) {
    super(hopDongThueRepository);
  }
  async createHopDongThue(
    user: AuthUser,
    createHopDongThueDto: CreateHopDongThueDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const unit = await this.unitService.getOne({
        where: { _id: createHopDongThueDto.unitId, userId: user.id },
      });
      if (!unit) {
        throw ApiError.NotFound('Đơn vị cho thuê không tồn tại');
      }
      if (unit.trangThaiThue !== UnitTrangThaiThue.TRONG) {
        throw ApiError.BadRequest('Đơn vị đã có người thuê hoặc đang bảo trì');
      }
      if (user.id === createHopDongThueDto.khachHangUserId) {
        throw ApiError.BadRequest('Bạn không thể tạo hợp đồng thuê đơn vị này');
      }
      const khachHangUser = await this.usersService.getOne(
        {
          where: { _id: createHopDongThueDto.khachHangUserId },
          transaction,
        },
      );
      if (!khachHangUser) {
        throw ApiError.NotFound('Khách hàng không tồn tại');
      }
    const hopDongThue = await this.hopDongThueRepository.create(
      {
        ...createHopDongThueDto,
        userId: user.id,
        unitId: unit._id,
        khachHangUserId: khachHangUser._id,
      },
      { transaction },
    );
    if (!hopDongThue) {
      throw ApiError.BadRequest('Lỗi khi tạo hợp đồng thuê');
    }
    const tenant = await this.tenantChoThueService.createYeuCauChoThue(user, {
      khachHangUserId: khachHangUser._id,
      hopDongThueId: hopDongThue._id,
    }, { transaction });
    if (!tenant) {
      throw ApiError.BadRequest('Lỗi khi tạo yêu cầu cho thuê');
    }
    await transaction.commit();
    return hopDongThue;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async kichHoatHopDongThue(user: AuthUser, hopDongThueId: string) {
    const transaction = await this.sequelize.transaction();
    try {
    const hopDongThue = await this.hopDongThueRepository.getOne({
      where: { _id: hopDongThueId, khachHangUserId: user.id },
      transaction,
    });
    if (!hopDongThue) {
      throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
    }
    if (hopDongThue.trangThai !== HopDongTrangThai.CHO_XAC_NHAN) {
      throw ApiError.BadRequest('Hợp đồng thuê không thể được kích hoạt');
    }
    hopDongThue.trangThai = HopDongTrangThai.DANG_THUE;
      await this.hopDongThueRepository.updateOne(hopDongThue, {
        where: { _id: hopDongThueId },
        transaction,
      });
      await transaction.commit();
      return hopDongThue;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async huyHopDongThue(user: AuthUser, hopDongThueId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const hopDongThue = await this.hopDongThueRepository.getOne({
        where: { _id: hopDongThueId, userId: user.id },
        transaction,
      });
      if (!hopDongThue) {
        throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
      }
      hopDongThue.trangThai = HopDongTrangThai.DA_HUY;
      await this.hopDongThueRepository.updateOne(hopDongThue, {
        where: { _id: hopDongThueId },
        transaction,
      });
      await transaction.commit();
      return hopDongThue;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async nguoiChoThueGetPage(user: AuthUser, query: QueryOption) {
    return this.getPage(
      {
        where: { userId: user.id },
        include: [
          {
            model: UnitModel,
          },
        ],
      },
      query,
    );
  }
  async nguoiChoThueGetOne(user: AuthUser, hopDongThueId: string) {
    return this.getOne({
      where: { _id: hopDongThueId, userId: user.id },
      include: [
        {
          model: UnitModel,
        },
      ],
    });
  }
  // nguoi thue
  async nguoiThueGetPage(user: AuthUser, query: QueryOption) {
    return this.getPage(
      {
        where: { khachHangUserId: user.id },
        include: [
          {
            model: UnitModel,
          },
        ],
      },
      query,
    );
  }
  async nguoiThueGetOne(user: AuthUser, hopDongThueId: string) {
    return this.getOne({
      where: { _id: hopDongThueId, khachHangUserId: user.id },
      include: [
        {
          model: UnitModel,
        },
      ],
    });
  }
}
