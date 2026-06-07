import { MODULE_METADATA } from '@nestjs/common/constants';
import { NotificationModule } from '@/modules/notification/notification.module';
import { GiaoDichModule } from './giao-dich.module';

describe('GiaoDichModule', () => {
  it('imports NotificationModule for GiaoDichService notifications', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, GiaoDichModule);

    expect(imports).toContain(NotificationModule);
  });
});
