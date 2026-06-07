import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { GiaoDich } from '../entities/giao-dich.entity';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { TrangThaiGiaoDich, HAN_XAC_NHAN_GIO } from '../common/constants';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';

interface TaoTuPhienInput {
  phienId: string;
  loaiPhien: LoaiPhien;
  chuPhienId: string;
  nguoiThangId: string;
  giaChot?: number;
}

@Injectable()
export class GiaoDichService extends BaseService<GiaoDich> {
  constructor(
    private readonly giaoDichRepository: GiaoDichRepository,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {
    super(giaoDichRepository);
  }

  async taoTuPhien(input: TaoTuPhienInput): Promise<GiaoDich> {
    const existing = await this.giaoDichRepository.getOne({
      where: { phienId: input.phienId },
    });
    if (existing) return existing;

    const hanXacNhan = new Date(Date.now() + HAN_XAC_NHAN_GIO * 60 * 60 * 1000);
    const giaoDich = await this.giaoDichRepository.create({
      phienId: input.phienId,
      loaiPhien: input.loaiPhien,
      chuPhienId: input.chuPhienId,
      nguoiThangId: input.nguoiThangId,
      giaChot: input.giaChot ?? null,
      trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      hanXacNhan,
    });

    await this.guiThongBao(
      [input.nguoiThangId],
      'GIAODICH_CAN_XAC_NHAN',
      'Bạn cần xác nhận giao dịch',
      `Bạn đã thắng một phiên. Vui lòng xác nhận trong vòng ${HAN_XAC_NHAN_GIO} giờ.`,
      giaoDich._id,
    );
    return giaoDich;
  }

  private async guiThongBao(
    userIds: string[],
    type: string,
    title: string,
    content: string,
    giaoDichId: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification({
        userIds,
        type,
        title,
        content,
        metadata: { targetId: giaoDichId, extra: { giaoDichId } },
      } as any);
    } catch (err) {
      // Không chặn flow nếu gửi thông báo lỗi
    }
  }
}
