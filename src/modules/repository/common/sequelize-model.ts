import { UserModel } from '@/modules/user/models/user.model';
import { NotificationModel } from '@/modules/notification/models/notification.model';
import { MailConfigModel } from '@/modules/mail-config/models/mail-config.model';
import { TenderSessionModel } from '@/modules/tender/models/tender-session.model';
import { TenderCriteriaModel } from '@/modules/tender/models/tender-criteria.model';
import { TenderSubmissionModel } from '@/modules/tender/models/tender-submission.model';
import { TenderSubmissionValueModel } from '@/modules/tender/models/tender-submission-value.model';
import { AuctionSessionModel } from '@/modules/auction/models/auction-session.model';
import { AuctionBidModel } from '@/modules/auction/models/auction-bid.model';
import { AuditLogModel } from '@/modules/audit-log/models/audit-log.model';
import { Model, ModelCtor } from 'sequelize-typescript';
import { DonViHanhChinhModel } from '@/modules/don-vi-hanh-chinh/models/don-vi-hanh-chinh.model';
import { ToChucProfileModel } from '@/modules/to-chuc-profile/models/to-chuc-profile.model';
import { XacMinhUserModel } from '@/modules/xac-minh-user/models/xac-minh-user.model';

export const SequelizeModel: ModelCtor<Model>[] = [
  UserModel,
  NotificationModel,
  MailConfigModel,
  TenderSessionModel,
  TenderCriteriaModel,
  TenderSubmissionModel,
  TenderSubmissionValueModel,
  AuctionSessionModel,
  AuctionBidModel,
  AuditLogModel,
  DonViHanhChinhModel,
  ToChucProfileModel,
  XacMinhUserModel,
];
