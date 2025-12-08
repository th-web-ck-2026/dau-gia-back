import { ModuleNotification, NotificationType, PhanHeNotification } from '@/modules/notification/common/constant';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { Injectable } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantNotificationService {
  constructor(private readonly notificationService: NotificationService) {}
  async taoYeuCauChoThue(tenant: Tenant) {
    await this.notificationService.createNotification({
      userIds: [tenant.khachHangUserId],
      type: NotificationType.HE_THONG,
      title: 'Bạn có 1 yêu cầu cho thuê đơn vị này cần xử lý',
      content: 'Bạn có 1 yêu cầu cho thuê đơn vị này cần xử lý',
      metadata: {
        phanHe: PhanHeNotification.TENANT,
        module: ModuleNotification.HO_DONG_THUE,
        targetId: tenant._id,
      },
    });
  }
}
