import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Tenant } from '../entities/tenant.entity';
import { TenantRepository } from '../repositories/tenant.repository';
import { CreateYeuCauChoThueDto } from '../dto/create-yeu-cau.dto';
import { UnitService } from '@/modules/unit/services/unit.service';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiError } from '@/common/exceptions/api-error';
import { UnitTrangThaiThue } from '@/modules/unit/common/constant';
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
  ) {
    const unit = await this.unitService.getOne({
      where: { _id: createYeuCauChoThueDto.unitId, userId: user.id },
    });
    if (!unit) {
      throw ApiError.NotFound('Đơn vị cho thuê không tồn tại');
    }
    if (unit.trangThaiThue !== UnitTrangThaiThue.TRONG) {
      throw ApiError.BadRequest('Đơn vị đã có người thuê');
    }
    return this.tenantRepository.create(createYeuCauChoThueDto);
  }
}
