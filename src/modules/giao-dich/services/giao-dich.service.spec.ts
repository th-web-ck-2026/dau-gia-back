import { Test, TestingModule } from '@nestjs/testing';
import { GiaoDichService } from './giao-dich.service';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

describe('GiaoDichService', () => {
  let service: GiaoDichService;
  let repo: any;

  const mockRepo = {
    create: jest.fn(),
    getById: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getPage: jest.fn(),
    updateOne: jest.fn(),
  };
  const mockUsersService = { getOne: jest.fn() };
  const mockNotificationService = { createNotification: jest.fn().mockResolvedValue({}) };
  const mockAuditLogService = { logAction: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiaoDichService,
        { provide: GiaoDichRepository, useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<GiaoDichService>(GiaoDichService);
    repo = module.get<GiaoDichRepository>(GiaoDichRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('taoTuPhien', () => {
    it('tạo giao dịch mới với trạng thái CHO_XAC_NHAN và hạn 48h', async () => {
      repo.getOne.mockResolvedValue(null);
      repo.create.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.taoTuPhien({
        phienId: 'p1',
        loaiPhien: LoaiPhien.DAU_GIA,
        chuPhienId: 'host1',
        nguoiThangId: 'winner1',
        giaChot: 500,
      });

      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_XAC_NHAN);
      expect(res.hanXacNhan).toBeInstanceOf(Date);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phienId: 'p1', nguoiThangId: 'winner1', giaChot: 500 }),
      );
    });

    it('idempotent: đã có giao dịch cho phiên thì trả về cái cũ, không tạo mới', async () => {
      repo.getOne.mockResolvedValue({ _id: 'gd1', phienId: 'p1' });
      const res = await service.taoTuPhien({
        phienId: 'p1',
        loaiPhien: LoaiPhien.DAU_GIA,
        chuPhienId: 'host1',
        nguoiThangId: 'winner1',
      });
      expect(res._id).toBe('gd1');
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
