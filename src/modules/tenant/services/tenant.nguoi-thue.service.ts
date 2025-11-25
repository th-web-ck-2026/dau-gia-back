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

@Injectable()
export class TenantNguoiThueService extends BaseService<Tenant> {
  constructor(
    private readonly tenantRepository: TenantRepository,
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
      },
      query,
    );
  }
  async getYeuCauChoThueMeById(user: AuthUser, id: string): Promise<Tenant> {
    return this.getOne({
      where: { _id: id, khachHangUserId: user.id },
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
          ? TenantTrangThai.DANG_THUE
          : TenantTrangThai.DA_HUY;
      const res = await this.tenantRepository.updateOne(tenant, {
        where: { _id: tenantId },
        transaction,
      });
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
