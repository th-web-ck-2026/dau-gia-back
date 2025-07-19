import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { Column } from 'sequelize-typescript';

export class Report implements BaseEntity {
  @StrObjectId()
  _id: string;

  @Column
  reporterId: string; // ID of the user who created the report (student or tutor)

  @Column
  reportedUserId: string; // ID of the user being reported (student or tutor)

  @Column({ allowNull: true })
  classId?: string; // ID of the class related to the report (optional)

  @Column
  reason: string; // Reason for the report

  @Column({ defaultValue: 'pending' })
  status: string; // Status of the report (e.g., pending, resolved, rejected)
}
