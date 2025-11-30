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
@Injectable()
export class TenantChoThueService extends BaseService<Tenant> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly unitService: UnitService,
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
    return this.tenantRepository.create(createYeuCauChoThueDto, {
      transaction: options?.transaction,
    });
  }
}
