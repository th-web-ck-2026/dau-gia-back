import {
  Table,
  Model,
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { XacMinhUser } from '../entities/xac-minh-user.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { TrangThaiXacMinhUser } from '../common/constant';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';

@Table({
  tableName: EntityTable.XAC_MINH_USER,
})
export class XacMinhUserModel extends Model implements XacMinhUser {
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @BelongsTo(() => UserModel)
  user: User;
  @Column
  anhCccdTruoc: string;
  @Column
  anhCccdSau: string;
  @Column
  anhChanDung: string;
  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiXacMinhUser)),
    defaultValue: TrangThaiXacMinhUser.CHO_DUYET,
  })
  trangThai: TrangThaiXacMinhUser;
  @Column
  ghiChu: string;
  @Column
  ngayXacMinh: Date;
  @Column
  lyDoTuChoi: string;
  @StrObjectId()
  _id: string;
}
