import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { TenantModel } from '@/modules/tenant/models/tenant.model';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';
import { UserModel } from '@/modules/user/models/user.model';
import { NotificationModel } from '@/modules/notification/models/notification.model';
import { MailConfigModel } from '@/modules/mail-config/models/mail-config.model';
import { Model, ModelCtor } from 'sequelize-typescript';
import { HoaDonModel } from '@/modules/hoa-don/models/hoa-don.model';
import { ThongTinThanhToanModel } from '@/modules/thong-tin-thanh-toan/models/thong-tin-thanh-toan.model';
import { YeuCauBaoTriBaoDuongModel } from '@/modules/yeu-cau-bao-tri-bao-duong/models/yeu-cau-bao-tri-bao-duong.model';
import { KyThanhToanModel } from '@/modules/hop-dong-thue/models/ky-thanh-toan.model';

export const SequelizeModel: ModelCtor<Model>[] = [
  UserModel,
  PropertieModel,
  UnitModel,
  TenantModel,
  HopDongThueModel,
  NotificationModel,
  MailConfigModel,
  HoaDonModel,
  ThongTinThanhToanModel,
  YeuCauBaoTriBaoDuongModel,
  KyThanhToanModel,
];
