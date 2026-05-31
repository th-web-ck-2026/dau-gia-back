import { Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogService extends BaseService<AuditLog> {
  constructor(private readonly auditLogRepository: AuditLogRepository) {
    super(auditLogRepository);
  }

  async logAction(
    nguoiThucHienId: string | undefined,
    hanhDong: string,
    loaiDoiTuong: string,
    doiTuongId: string,
    truocKhi?: any,
    sauKhi?: any,
    duLieuBoSung?: any,
  ): Promise<AuditLog> {
    return this.create({
      nguoiThucHienId,
      hanhDong,
      loaiDoiTuong,
      doiTuongId,
      truocKhi,
      sauKhi,
      duLieuBoSung,
    });
  }
}
