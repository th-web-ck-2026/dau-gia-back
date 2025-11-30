import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Tenant } from '../entities/tenant.entity';
import { TenantRepository } from '../repositories/tenant.repository';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { PageableDto } from '@/common/dto/pageable.dto';
import { ApiError } from '@/common/exceptions/api-error';
import { TenantTrangThai, TenantTrangThaiPhanHoi } from '../common/constant';
import { Sequelize } from 'sequelize-typescript';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { HopDongThueService } from '@/modules/hop-dong-thue/services/hop-dong-thue.service';

@Injectable()
export class TenantNguoiThueService extends BaseService<Tenant> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly hopDongThueService: HopDongThueService,
    private readonly sequelize: Sequelize,
  ) {
    super(tenantRepository);
  }
  async getPageYeuCauChoThueMe(
    user: AuthUser,
    query: QueryOption,
  ): Promise<PageableDto<Tenant>> {
    return this.getPage(
      {
        where: {
          khachHangUserId: user.id,
        },
        include: [
          {
            model: HopDongThueModel,
            include: [
              {
                model: UnitModel,
              },
            ],
          },
        ],
      },
      query,
    );
  }
  async getYeuCauChoThueMeById(user: AuthUser, id: string): Promise<Tenant> {
    return this.getOne({
      where: { _id: id, khachHangUserId: user.id },
      include: [
        {
          model: HopDongThueModel,
          include: [
            {
              model: UnitModel,
            },
          ],
        },
      ],
    });
  }
  async phanHoiYeuCauChoThue(
    user: AuthUser,
    tenantId: string,
    trangThai: TenantTrangThaiPhanHoi,
  ): Promise<Tenant> {
    const transaction = await this.sequelize.transaction();
    try {
      const tenant = await this.tenantRepository.getOne({
        where: { _id: tenantId, khachHangUserId: user.id },
        transaction,
      });
      if (!tenant) {
        throw ApiError.NotFound('Yêu cầu cho thuê không tồn tại');
      }
      tenant.trangThai =
        trangThai === TenantTrangThaiPhanHoi.XAC_NHAN_THUE
          ? TenantTrangThai.XAC_NHAN_THUE
          : TenantTrangThai.TU_CHOI_THUE;
      const res = await this.tenantRepository.updateOne(tenant, {
        where: { _id: tenantId },
        transaction,
      });
      if (trangThai === TenantTrangThaiPhanHoi.XAC_NHAN_THUE) {
        await this.hopDongThueService.kichHoatHopDongThue(user, tenant.hopDongThueId);
      } else {
        await this.hopDongThueService.huyHopDongThue(user, tenant.hopDongThueId);
      }
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
