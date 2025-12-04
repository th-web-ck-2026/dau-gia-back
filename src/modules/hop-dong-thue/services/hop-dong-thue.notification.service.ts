import { ModuleNotification, NotificationType, PhanHeNotification } from '@/modules/notification/common/constant';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { Injectable } from '@nestjs/common';
import { HopDongThue } from '../entities/hop-dong-thue.entity';

@Injectable()
export class HopDongThueNotificationService {
  constructor(private readonly notificationService: NotificationService) {}
  async hopDongThueDuocKichHoat(hopDongThue: HopDongThue) {
    await this.notificationService.createNotification({
      userIds: [hopDongThue.khachHangUserId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được kích hoạt',
      content: 'Hợp đồng thuê đã được kích hoạt',
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HO_DONG_THUE,
        targetId: hopDongThue._id,
      },
    });
    await this.notificationService.createNotification({
      userIds: [hopDongThue.userId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được kích hoạt',
      content: 'Hợp đồng thuê đã được kích hoạt',
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HO_DONG_THUE,
        targetId: hopDongThue._id,
      },
    });
  }
  async hopDongThueDuocHuy(hopDongThue: HopDongThue) {
    await this.notificationService.createNotification({
      userIds: [hopDongThue.khachHangUserId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được hủy',
      content: 'Hợp đồng thuê đã được hủy',
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HO_DONG_THUE,
        targetId: hopDongThue.khachHangUserId,
      },
    });
    await this.notificationService.createNotification({
      userIds: [hopDongThue.userId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được hủy',
      content: 'Hợp đồng thuê đã được hủy',
      metadata: {
        phanHe: PhanHeNotification.OWNER,
        module: ModuleNotification.HO_DONG_THUE,
        targetId: hopDongThue._id,
      },
    });
  }
}
