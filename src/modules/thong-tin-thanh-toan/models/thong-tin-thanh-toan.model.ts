import {
  Table,
  Model,
  Column,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.THONG_TIN_THANH_TOAN,
})
export class ThongTinThanhToanModel extends Model implements ThongTinThanhToan {
  @StrObjectId()
  _id: string;
  @Column
  soTaiKhoan: string;
  @Column
  tenTaiKhoan: string;
  @Column
  tenNganHang: string;
  @Column
  ghiChu?: string;
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @Column({
    type: DataType.TEXT,
  })
  qrImage?: string;
}
