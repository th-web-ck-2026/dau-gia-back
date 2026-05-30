import { Table, Column, DataType, Model, ForeignKey } from 'sequelize-typescript';
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

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nguoiThamGiaId: string;

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
    type: DataType.DATE,
    allowNull: false,
  })
  thoiDiemDat: Date;
}
