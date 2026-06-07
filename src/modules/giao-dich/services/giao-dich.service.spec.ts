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

  describe('luồng thanh toán (đấu giá)', () => {
    const base = {
      _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
      loaiPhien: LoaiPhien.DAU_GIA,
    };

    it('người thắng báo đã chuyển khoản → DA_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.baoDaChuyenKhoan('winner1', 'gd1', { anhChungTu: ['a.jpg'] });
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_THANH_TOAN);
      expect(res.anhChungTu).toEqual(['a.jpg']);
    });

    it('chủ phiên xác nhận nhận tiền → set mốc thời gian, vẫn DA_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN, ...v }));

      const res = await service.xacNhanNhanTien('host1', 'gd1');
      expect(res.thoiDiemChuPhienXacNhanTien).toBeInstanceOf(Date);
    });

    it('chủ phiên hoàn tất → HOAN_TAT', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.hoanTat('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.HOAN_TAT);
    });
  });

  describe('getChiTiet', () => {
    it('chưa xác nhận → không lộ liên hệ', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      const res = await service.getChiTiet('host1', 'gd1', 'USER');
      expect(res.lienHe).toBeUndefined();
    });

    it('đã xác nhận → lộ liên hệ 2 bên + thông tin CK chủ phiên', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN, giaChot: 500,
      });
      mockUsersService.getOne
        .mockResolvedValueOnce({ _id: 'host1', fullname: 'Chủ', email: 'h@x.com', phone: '0900000000', diaChi: 'HN', tenNganHang: 'VCB', soTaiKhoan: '123', tenTaiKhoan: 'CHU' })
        .mockResolvedValueOnce({ _id: 'winner1', fullname: 'Thắng', email: 'w@x.com', phone: '0911111111', diaChi: 'HCM' });

      const res = await service.getChiTiet('winner1', 'gd1', 'USER');
      expect(res.lienHe.chuPhien.email).toBe('h@x.com');
      expect(res.lienHe.nguoiThang.phone).toBe('0911111111');
      expect(res.thongTinChuyenKhoan.soTaiKhoan).toBe('123');
    });

    it('người ngoài cuộc → Forbidden', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      await expect(service.getChiTiet('nguoila', 'gd1', 'USER')).rejects.toThrow(ApiError);
    });
  });

  describe('luồng đấu thầu (ký HĐ + bàn giao)', () => {
    const base = {
      _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
      loaiPhien: LoaiPhien.DAU_THAU,
    };

    it('chủ phiên ký → chỉ set chuPhienDaKy, vẫn CHO_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, chuPhienDaKy: false, nguoiThangDaKy: false });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, nguoiThangDaKy: false, ...v }));

      const res = await service.kyHopDong('host1', 'gd1');
      expect(res.chuPhienDaKy).toBe(true);
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_KY_HOP_DONG);
    });

    it('người thắng ký khi chủ phiên đã ký → DA_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, chuPhienDaKy: true, nguoiThangDaKy: false });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, chuPhienDaKy: true, ...v }));

      const res = await service.kyHopDong('winner1', 'gd1');
      expect(res.nguoiThangDaKy).toBe(true);
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_KY_HOP_DONG);
    });

    it('chủ phiên bàn giao → DANG_BAN_GIAO', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_KY_HOP_DONG });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.banGiao('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DANG_BAN_GIAO);
      expect(res.daBanGiao).toBe(true);
    });

    it('người thắng xác nhận nhận → HOAN_TAT', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DANG_BAN_GIAO });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.xacNhanNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.HOAN_TAT);
      expect(res.nguoiThangXacNhanNhan).toBe(true);
    });

    it('người ngoài cuộc ký → Forbidden', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_THAU, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG,
        chuPhienDaKy: false, nguoiThangDaKy: false,
      });
      await expect(service.kyHopDong('hacker1', 'gd1')).rejects.toThrow(ApiError);
    });

    it('sai trạng thái nguồn kyHopDong → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_THAU, trangThai: TrangThaiGiaoDich.DA_KY_HOP_DONG,
        chuPhienDaKy: true, nguoiThangDaKy: true,
      });
      await expect(service.kyHopDong('host1', 'gd1')).rejects.toThrow(ApiError);
    });
  });

  describe('capNhatGhiChu', () => {
    it('chủ phiên cập nhật ghi chú của mình', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.capNhatGhiChu('host1', 'gd1', { ghiChu: 'Gặp 9h' });
      expect(res.ghiChuLienHeChuPhien).toBe('Gặp 9h');
    });

    it('chưa xác nhận → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      await expect(service.capNhatGhiChu('host1', 'gd1', { ghiChu: 'x' })).rejects.toThrow(ApiError);
    });
  });

  describe('huy', () => {
    it('chủ phiên hủy giao dịch non-terminal → DA_HUY', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.huy('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_HUY);
    });

    it('hủy giao dịch đã HOAN_TAT → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.HOAN_TAT,
      });
      await expect(service.huy('host1', 'gd1')).rejects.toThrow(ApiError);
    });
  });

  describe('getPageMe', () => {
    it('lọc giao dịch mà tôi là chủ phiên HOẶC người thắng', async () => {
      repo.getPage.mockResolvedValue({ data: [], total: 0 } as any);
      await service.getPageMe('u1', {}, {});
      expect(repo.getPage).toHaveBeenCalled();
    });
  });
});
