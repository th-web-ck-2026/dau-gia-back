import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuctionBid } from '../entities/auction-bid.entity';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { AuctionSessionModel } from './auction-session.model';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUCTION_BID,
})
export class AuctionBidModel extends Model implements AuctionBid {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => AuctionSessionModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phienId: string;

  @BelongsTo(() => AuctionSessionModel, {
    foreignKey: 'phienId',
    as: 'phien',
  })
  phien: AuctionSessionModel;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nguoiThamGiaId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'nguoiThamGiaId',
    as: 'nguoiThamGia',
  })
  nguoiThamGia: UserModel;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  giaDat: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 100,
    allowNull: false,
  })
  diemUyTin: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 100,
  })
  diemCamKet?: number;

  @Column({
    type: DataType.FLOAT,
  })
  diemChuanHoaGia?: number;

  @Column({
    type: DataType.FLOAT,
  })
  diemTongHop?: number;

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiDeXuat)),
    defaultValue: TrangThaiDeXuat.CHO_DUYET,
    allowNull: false,
  })
  trangThai: TrangThaiDeXuat;

  @Column({
    type: DataType.INTEGER,
  })
  thuHang?: number;

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  thuTuServer?: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiDiemDat: Date;
}
