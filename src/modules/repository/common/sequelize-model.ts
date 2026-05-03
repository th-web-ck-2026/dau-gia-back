import { UserModel } from '@/modules/user/models/user.model';
import { NotificationModel } from '@/modules/notification/models/notification.model';
import { MailConfigModel } from '@/modules/mail-config/models/mail-config.model';
import { Model, ModelCtor } from 'sequelize-typescript';

export const SequelizeModel: ModelCtor<Model>[] = [
  UserModel,
  NotificationModel,
  MailConfigModel,
];
