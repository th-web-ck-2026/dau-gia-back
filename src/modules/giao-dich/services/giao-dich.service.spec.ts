import { Test, TestingModule } from '@nestjs/testing';
import { GiaoDichService } from './giao-dich.service';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich, LyDoThatBai } from '../common/constants';
import { ApiError } from '@/common/exceptions/api-error';

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

  describe('xacNhan', () => {
    it('người thắng xác nhận đấu giá → DA_XAC_NHAN rồi auto CHO_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.xacNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_THANH_TOAN);
    });

    it('người thắng xác nhận đấu thầu → CHO_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_THAU, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.xacNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_KY_HOP_DONG);
    });

    it('không phải người thắng → Forbidden', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      const err = await service.xacNhan('hacker1', 'gd1').catch(e => e);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.getStatus()).toBe(403);
    });

    it('sai trạng thái nguồn → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.HOAN_TAT,
      });
      const err = await service.xacNhan('winner1', 'gd1').catch(e => e);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.getStatus()).toBe(400);
    });
  });

  describe('tuChoi', () => {
    it('người thắng từ chối → THAT_BAI (TU_CHOI)', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.tuChoi('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.THAT_BAI);
      expect(res.lyDoThatBai).toBe(LyDoThatBai.TU_CHOI);
    });
  });
});
