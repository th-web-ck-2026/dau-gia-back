import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Tenant } from '../entities/tenant.entity';
import { TenantRepository } from '../repositories/tenant.repository';
import { CreateYeuCauChoThueDto } from '../dto/create-yeu-cau.dto';
import { UnitService } from '@/modules/unit/services/unit.service';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiError } from '@/common/exceptions/api-error';
import { UnitTrangThaiThue } from '@/modules/unit/common/constant';
import { Transaction } from 'sequelize';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { HopDongThueService } from '@/modules/hop-dong-thue/services/hop-dong-thue.service';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { UserModel } from '@/modules/user/models/user.model';
import { TenantNotificationService } from './tenant.notification.service';
import { ConditionTenantDto } from '../dto/condition-tenant.dto';
import { PageableDto } from '@Common/dto/pageable.dto';
import { FindOptions } from 'sequelize';
@Injectable()
export class TenantChoThueService extends BaseService<Tenant> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly tenantNotificationService: TenantNotificationService,
  ) {
    super(tenantRepository);
  }
  async createYeuCauChoThue(
    user: AuthUser,
    createYeuCauChoThueDto: CreateYeuCauChoThueDto,
    options?: { transaction?: Transaction },
  ) {
    if (user.id === createYeuCauChoThueDto.khachHangUserId) {
      throw ApiError.BadRequest('Bạn không thể yêu cầu cho thuê đơn vị này');
    }

    const tenant = await this.tenantRepository.create(createYeuCauChoThueDto, {
      transaction: options?.transaction,
    });
    if (!tenant) {
      throw ApiError.BadRequest('Lỗi khi tạo yêu cầu cho thuê');
    }
    await this.tenantNotificationService.taoYeuCauChoThue(tenant, createYeuCauChoThueDto.hopDongThueId);
    return tenant;
  }
  async getDanhSachNguoiThuePage(
    user: AuthUser,
    condition: ConditionTenantDto,
    query: QueryOption,
  ) {
    const { page = 1, limit = 10, offset = (page - 1) * limit, order } = query;

    const findOptions: FindOptions = {
      where: { ...condition },
      include: [
        {
          model: HopDongThueModel,
          where: { userId: user.id },
          required: true,
          attributes: [],
        },
        {
          model: UserModel,
          as: 'khachHangUser',
          required: true,
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
      ],
      attributes: ['khachHangUserId'],
      group: [
        'TenantModel.khachHangUserId',
        'khachHangUser._id',
        'khachHangUser.fullname',
        'khachHangUser.email',
        'khachHangUser.phone',
        'khachHangUser.avatar',
      ],
      limit,
      offset,
      subQuery: false,
      order,
    };

    const { rows, count } = await this.tenantRepository.findAndCountAll(
      findOptions,
    );
    const total = Array.isArray(count) ? count.length : count;

    return PageableDto.create(query, total, rows);
  }
}
