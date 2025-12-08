import { Table, Model, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { HoaDon } from "../entities/hoa-don.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { HoaDonType, HoaDonTrangThai, HoaDonTrangThaiKhachHangThanhToan } from '../common/constant';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { HopDongThue } from '@/modules/hop-dong-thue/entities/hop-dong-thue.entity';
import { UserModel } from '@/modules/user/models/user.model';
import { DichVuHoaDon } from '../dto/dich-vu-hoa-don.dto';
import { User } from '@/modules/user/entities/user.entity';
import { HdtThongTinThanhToanDto } from '@/modules/thong-tin-thanh-toan/dto/hd-thong-tin-thanh-toan.dto';
import { KyThanhToan } from '@/modules/hop-dong-thue/entities/ky-thanh-toan.entity';
import { KyThanhToanModel } from '@/modules/hop-dong-thue/models/ky-thanh-toan.model';

@Table({
  tableName: EntityTable.HOA_DON,
  indexes: [
    {
      fields: ['maHoaDon'],
      unique: true,
    },
    {
      fields: ['hopDongThueId'],
    },
    {
      fields: ['userId'],
    },
  ],
})
export class HoaDonModel extends Model implements HoaDon {
  @Column
  @ForeignKey(() => UserModel)
  khachHangUserId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'khachHangUserId',
    onDelete: 'CASCADE',
  })
  khachHangUser: User;
  @StrObjectId()
  _id: string;

  @Column
  @ForeignKey(() => HopDongThueModel)
  hopDongThueId: string;

  @BelongsTo(() => HopDongThueModel, {
    foreignKey: 'hopDongThueId',
    onDelete: 'CASCADE',
  })
  hopDongThue: HopDongThue;

  @Column({
    type: DataType.ENUM(...Object.values(HoaDonType)),
  })
  loaiHoaDon: HoaDonType;

  @Column({
    unique: true,
    allowNull: true,
  })
  maHoaDon?: string;

  @Column({
    allowNull: true,
  })
  ngayThanhToan?: Date;

  @Column({
    allowNull: true,
  })
  hanThanhToan?: Date;

  @Column({
    type: DataType.JSONB,
  })
  dichVus: DichVuHoaDon[];

  @Column({
    type: DataType.DECIMAL(15, 2),
  })
  tongTien: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  ghiChu?: string;

  @Column({
    type: DataType.ENUM(...Object.values(HoaDonTrangThai)),
    defaultValue: HoaDonTrangThai.CHO_THANH_TOAN,
  })
  trangThai: HoaDonTrangThai;

  @Column({
    type: DataType.ENUM(...Object.values(HoaDonTrangThaiKhachHangThanhToan)),
    defaultValue: HoaDonTrangThaiKhachHangThanhToan.CHO_THANH_TOAN,
  })
  trangThaiKhachHangThanhToan: HoaDonTrangThaiKhachHangThanhToan;

  @Column({
    allowNull: true,
  })
  @ForeignKey(() => UserModel)
  userId?: string;
  @Column({
    allowNull: true,
  })
  ngayKhachHangThanhToan?: Date;
  @Column({
    allowNull: true,
  })
  ngayXacNhanThanhToan?: Date;
  @Column({
    allowNull: true,
    defaultValue: false,
  })
  trangThaiQuaHan?: boolean;
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  thongTinThanhToan: HdtThongTinThanhToanDto;
  @Column
  @ForeignKey(() => KyThanhToanModel)
  kyThanhToanId: string;
  @BelongsTo(() => KyThanhToanModel, {
    foreignKey: 'kyThanhToanId',
    onDelete: 'CASCADE',
  })
  kyThanhToan: KyThanhToan;
}
