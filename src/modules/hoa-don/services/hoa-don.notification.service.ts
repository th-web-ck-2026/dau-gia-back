import { NotificationService } from '@/modules/notification/services/notification.service';
import { Injectable } from '@nestjs/common';
import { HoaDon } from '../entities/hoa-don.entity';
import {
  ModuleNotification,
  NotificationType,
  PhanHeNotification,
} from '@/modules/notification/common/constant';
import { formatDate, formatMoney } from '@/common/utils/string.utils';
import { TrangThaiXacNhanNoiDungHoaDon } from '../common/constant';

@Injectable()
export class HoaDonNotificationService {
  constructor(private readonly notificationService: NotificationService) {}

  async hoaDonDuocTao(hoaDon: HoaDon) {
    const title = 'Hóa đơn kỳ mới sẵn sàng';
    const content = `Hóa đơn kỳ mới (#${hoaDon.maHoaDon ?? hoaDon._id}) gồm ${hoaDon.dichVus?.length ?? 0} dịch vụ đã được tạo. Tổng tiền: ${formatMoney(hoaDon.tongTien)}. Vui lòng thanh toán trước ngày ${formatDate(hoaDon.hanThanhToan)}.`;

    await this.notificationService.createNotification({
      userIds: [hoaDon.khachHangUserId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async hoaDonDuocKhachHangXacNhanThanhToan(hoaDon: HoaDon) {
    const title = 'Hóa đơn đã được xác nhận thanh toán';
    const content = `Hóa đơn (#${hoaDon.maHoaDon ?? hoaDon._id}) đã được xác nhận thanh toán. Tổng tiền: ${formatMoney(hoaDon.tongTien)}.`;

    await this.notificationService.createNotification({
      userIds: [hoaDon.userId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async hoaDonDaXacNhanThanhToan(hoaDon: HoaDon) {
    const title = 'Hóa đơn đã được thanh toán';
    const content = `Hóa đơn (#${hoaDon.maHoaDon ?? hoaDon._id}) đã được thanh toán. Tổng tiền: ${formatMoney(hoaDon.tongTien)}.`;

    await this.notificationService.createNotification({
      userIds: [hoaDon.khachHangUserId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async hoaDonQuaHanThanhToan(hoaDon: HoaDon) {
    const title = 'Hóa đơn đã quá hạn thanh toán';
    const content = `Hóa đơn #${hoaDon.maHoaDon ?? hoaDon._id} đã quá hạn thanh toán vào ngày ${formatDate(hoaDon.hanThanhToan)}.\n Tổng tiền còn nợ: ${formatMoney(hoaDon.tongTien)}.\n Vui lòng thanh toán sớm nhất có thể.`;

    await this.notificationService.createNotification({
      userIds: [hoaDon.userId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
    await this.notificationService.createNotification({
      userIds: [hoaDon.khachHangUserId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async nhacNhoThanhToanHoaDon(hoaDon: HoaDon) {
    const title = 'Nhắc nhở thanh toán hóa đơn';
    const content = `Hóa đơn #${hoaDon.maHoaDon ?? hoaDon._id} đã đến hạn thanh toán vào ngày ${formatDate(hoaDon.hanThanhToan)}.\n Tổng tiền còn nợ: ${formatMoney(hoaDon.tongTien)}.\n Vui lòng thanh toán sớm nhất có thể.`;
    await this.notificationService.createNotification({
      userIds: [hoaDon.khachHangUserId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async hoaDonDuocHuy(hoaDon: HoaDon) {
    const title = 'Hóa đơn đã được hủy';
    const content = `Hóa đơn (#${hoaDon.maHoaDon ?? hoaDon._id}) đã được hủy. Tổng tiền: ${formatMoney(hoaDon.tongTien)}.`;

    await this.notificationService.createNotification({
      userIds: [hoaDon.userId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
  async hoaDonDuocKhachHangXacNhanNoiDung(
    hoaDon: HoaDon,
    trangThaiXacNhan: TrangThaiXacNhanNoiDungHoaDon,
    ghiChu?: string,
  ) {
    // them ghi chu vao content

    let title = '';
    let content = '';
    if (trangThaiXacNhan === TrangThaiXacNhanNoiDungHoaDon.XAC_NHAN) {
      title = 'Hóa đơn đã được xác nhận nội dung';
      content = `Hóa đơn (#${hoaDon.maHoaDon ?? hoaDon._id}) đã được xác nhận nội dung.\n ${ghiChu ? `Ghi chú: ${ghiChu}` : ''}`;
    } else {
      title = 'Hóa đơn đã được từ chối nội dung';
      content = `Hóa đơn (#${hoaDon.maHoaDon ?? hoaDon._id}) đã được từ chối nội dung.\n ${ghiChu ? `Ghi chú: ${ghiChu}` : ''}`;
    }
    await this.notificationService.createNotification({
      userIds: [hoaDon.userId],
      type: NotificationType.HE_THONG,
      title,
      content,
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HOA_DON,
        targetId: hoaDon._id,
      },
    });
  }
}
