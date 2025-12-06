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
import { UserModel } from '@/modules/user/models/user.model';
import { ConditionHopDongThueDto } from '../dto/condition-hop-dong-thue.dto';
import { UpdateHopDongThueDto } from '../dto/update-hop-dong-thue.dto';
import { Op } from 'sequelize';
import { HopDongThueNotificationService } from './hop-dong-thue.notification.service';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';
import { KyThanhToanModel } from '../models/ky-thanh-toan.model';

@Injectable()
export class HopDongThueService extends BaseService<HopDongThue> {
  constructor(
    private readonly hopDongThueRepository: HopDongThueRepository,
    private readonly unitService: UnitService,
    private readonly usersService: UsersService,
    private readonly tenantChoThueService: TenantChoThueService,
    private readonly sequelize: Sequelize,
    private readonly hopDongThueNotificationService: HopDongThueNotificationService,
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
      const khachHangUser = await this.usersService.getOne({
        where: { _id: createHopDongThueDto.khachHangUserId },
        transaction,
      });
      if (!khachHangUser) {
        throw ApiError.NotFound('Khách hàng không tồn tại');
      }
      // Tách kyThanhToans ra khỏi data để tạo riêng
      const { kyThanhToans, ...hopDongThueData } = createHopDongThueDto;
      const hopDongThue = await this.hopDongThueRepository.create(
        {
          ...hopDongThueData,
          userId: user.id,
          unitId: unit._id,
          khachHangUserId: khachHangUser._id,
        },
        { transaction },
      );
      if (!hopDongThue) {
        throw ApiError.BadRequest('Lỗi khi tạo hợp đồng thuê');
      }
      const tenant = await this.tenantChoThueService.createYeuCauChoThue(
        user,
        {
          khachHangUserId: khachHangUser._id,
          hopDongThueId: hopDongThue._id,
        },
        { transaction },
      );
      if (!tenant) {
        throw ApiError.BadRequest('Lỗi khi tạo yêu cầu cho thuê');
      }
      // Tạo các kỳ thanh toán nếu có
      if (kyThanhToans && kyThanhToans.length > 0) {
        const kyThanhToanRecords = kyThanhToans.map((kyThanhToan) => ({
          ...kyThanhToan,
          hopDongThueId: hopDongThue._id,
        }));
        await KyThanhToanModel.bulkCreate(kyThanhToanRecords, { transaction });
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
      await this.unitService.updateOne(
        {
          trangThaiThue: UnitTrangThaiThue.DA_THUE,
        },
        {
          where: { _id: hopDongThue.unitId },
          transaction,
        },
      );
      await transaction.commit();
      await this.hopDongThueNotificationService.hopDongThueDuocKichHoat(
        hopDongThue,
      );
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
      await this.unitService.updateOne(
        {
          trangThaiThue: UnitTrangThaiThue.TRONG,
        },
        {
          where: { _id: hopDongThue.unitId },
          transaction,
        },
      );
      await transaction.commit();
      await this.hopDongThueNotificationService.hopDongThueDuocHuy(hopDongThue);
      return hopDongThue;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async nguoiChoThueGetPage(
    user: AuthUser,
    condition?: ConditionHopDongThueDto,
    query?: QueryOption,
  ) {
    return this.getPage(
      {
        where: {
          ...condition,
          userId: user.id,
        },
        include: [
          {
            model: UnitModel,
            include: [
              {
                model: PropertieModel,
              },
            ],
          },
          {
            model: UserModel,
            as: 'user',
            attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
          },
          {
            model: UserModel,
            as: 'khachHangUser',
            attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
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
          include: [
            {
              model: PropertieModel,
            },
          ],
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
        {
          model: UserModel,
          as: 'khachHangUser',
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
      ],
    });
  }
  async nguoiChoThueUpdateOne(
    user: AuthUser,
    hopDongThueId: string,
    updateHopDongThueDto: UpdateHopDongThueDto,
  ) {
    return this.updateOne(updateHopDongThueDto, {
      where: {
        _id: hopDongThueId,
        userId: user.id,
        trangThai: HopDongTrangThai.CHO_XAC_NHAN,
      },
    });
  }
  async nguoiChoThueDeleteOne(user: AuthUser, hopDongThueId: string) {
    return this.deleteOne({
      where: {
        _id: hopDongThueId,
        trangThai: {
          [Op.in]: [HopDongTrangThai.CHO_XAC_NHAN, HopDongTrangThai.DA_HUY],
        },
        userId: user.id,
      },
    });
  }
  async nguoiChoThueHoanThanhHopDong(user: AuthUser, hopDongThueId: string) {
    return this.updateOne({
      where: {
        _id: hopDongThueId,
        userId: user.id,
        trangThai: HopDongTrangThai.CHO_HOAN_THANH,
      },
      trangThai: HopDongTrangThai.CHO_HOAN_THANH,
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
            include: [
              {
                model: PropertieModel,
              },
            ],
          },
          {
            model: UserModel,
            as: 'user',
            attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
          },
          {
            model: UserModel,
            as: 'khachHangUser',
            attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
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
          include: [
            {
              model: PropertieModel,
            },
          ],
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
        {
          model: UserModel,
          as: 'khachHangUser',
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
      ],
    });
  }
  async nguoiThueGetPageUnitThue(user: AuthUser, query: QueryOption) {
    const hopDongPage = await this.getPage(
      {
        where: {
          khachHangUserId: user.id,
          trangThai: HopDongTrangThai.DANG_THUE,
        },
        include: [
          {
            model: UnitModel,
            attributes: ['_id', 'ten', 'moTa', 'code'],
          },
        ],
        attributes: ['_id'],
      },
      query,
    );
    hopDongPage.result = hopDongPage.result.map(
      (hopDong) => hopDong.unit,
    ) as any[];

    return hopDongPage;
  }
}
