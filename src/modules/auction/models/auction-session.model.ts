import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuctionSession } from '../entities/auction-session.entity';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';
import { AuctionBidModel } from './auction-bid.model';

@Table({
  tableName: EntityTable.AUCTION_SESSION,
})
export class AuctionSessionModel extends Model implements AuctionSession {
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  danhSachHinhAnh: string[];
  @StrObjectId()
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tieuDe: string;

  @Column({
    type: DataType.TEXT,
  })
  moTa?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ForeignKey(() => UserModel)
  chuPhienId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'chuPhienId',
    as: 'chuPhien',
  })
  chuPhien: User;
  
  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiPhien)),
    defaultValue: TrangThaiPhien.NHAP,
    allowNull: false,
  })
  trangThai: TrangThaiPhien;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianBatDau: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianKetThuc: Date;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  giaKhoiDiem: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  buocGia: number;


  @ForeignKey(() => AuctionBidModel)
  @Column({
    type: DataType.STRING,
  })
  deXuatThangId?: string;

  @BelongsTo(() => AuctionBidModel, {
    foreignKey: 'deXuatThangId',
    as: 'deXuatThang',
  })
  deXuatThang?: AuctionBidModel;

  @Column({
    type: DataType.DECIMAL,
  })
  giaCaoNhat?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  anDanh: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  soLuongNguoiThamGia: number;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemDong?: Date;
}
