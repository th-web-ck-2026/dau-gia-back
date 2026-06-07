import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { GiaoDich } from '../entities/giao-dich.entity';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { TrangThaiGiaoDich, LyDoThatBai, HAN_XAC_NHAN_GIO } from '../common/constants';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { ApiError } from '@Exceptions/api-error';

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

  private async layVaKiemTra(id: string): Promise<GiaoDich> {
    const gd = await this.giaoDichRepository.getById(id);
    if (!gd) throw ApiError.NotFound('Giao dịch không tồn tại');
    return gd;
  }

  private kiemTraVai(gd: GiaoDich, userId: string, vai: 'CHU_PHIEN' | 'NGUOI_THANG'): void {
    const ok = vai === 'CHU_PHIEN' ? gd.chuPhienId === userId : gd.nguoiThangId === userId;
    if (!ok) throw ApiError.Forbidden('Bạn không có quyền thực hiện hành động này');
  }

  private kiemTraTrangThai(gd: GiaoDich, nguon: TrangThaiGiaoDich): void {
    if (gd.trangThai !== nguon) {
      throw ApiError.BadRequest(`Hành động không hợp lệ ở trạng thái ${gd.trangThai}`);
    }
  }

  private async capNhat(id: string, values: Partial<GiaoDich>): Promise<GiaoDich> {
    return this.giaoDichRepository.updateOne(values as any, { where: { _id: id } });
  }

  async xacNhan(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_XAC_NHAN);

    const trangThaiKe =
      gd.loaiPhien === LoaiPhien.DAU_GIA
        ? TrangThaiGiaoDich.CHO_THANH_TOAN
        : TrangThaiGiaoDich.CHO_KY_HOP_DONG;

    const updated = await this.capNhat(id, {
      trangThai: trangThaiKe,
      thoiDiemXacNhan: new Date(),
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_XAC_NHAN', 'GiaoDich', id, null, null);

    const type =
      trangThaiKe === TrangThaiGiaoDich.CHO_THANH_TOAN
        ? 'GIAODICH_CAN_THANH_TOAN'
        : 'GIAODICH_CAN_KY_HD';
    await this.guiThongBao(
      [gd.chuPhienId, gd.nguoiThangId],
      type,
      'Giao dịch đã được xác nhận',
      'Người thắng đã xác nhận. Tiến hành bước tiếp theo.',
      id,
    );
    return updated;
  }

  async tuChoi(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_XAC_NHAN);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.THAT_BAI,
      lyDoThatBai: LyDoThatBai.TU_CHOI,
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_TU_CHOI', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId],
      'GIAODICH_THAT_BAI',
      'Người thắng đã từ chối',
      'Người thắng từ chối nhận. Giao dịch thất bại.',
      id,
    );
    return updated;
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
