import { Test, TestingModule } from '@nestjs/testing';
import { AuctionService } from './auction.service';
import { AuctionSessionRepository } from '../repositories/auction-session.repository';
import { AuctionBidRepository } from '../repositories/auction-bid.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat } from '@/modules/scoring/common/constants';

describe('AuctionService', () => {
  let service: AuctionService;
  let sessionRepo: any;
  let bidRepo: any;

  const mockSessionRepo = {
    create: jest.fn(),
    getOne: jest.fn(),
    updateOne: jest.fn(),
    updateAtomic: jest.fn(),
  };

  const mockBidRepo = {
    create: jest.fn(),
    getMany: jest.fn(),
    updateOne: jest.fn(),
    getOne: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionService,
        ScoringService,
        { provide: AuctionSessionRepository, useValue: mockSessionRepo },
        { provide: AuctionBidRepository, useValue: mockBidRepo },
      ],
    }).compile();

    service = module.get<AuctionService>(AuctionService);
    sessionRepo = module.get<AuctionSessionRepository>(AuctionSessionRepository);
    bidRepo = module.get<AuctionBidRepository>(AuctionBidRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should throw BadRequest if start date is in the past', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2020-01-01T00:00:00.000Z',
        thoiGianKetThuc: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        giaKhoiDiem: 100,
        buocGia: 10,
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if end date is in the past', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        thoiGianKetThuc: '2020-01-01T00:00:00.000Z',
        giaKhoiDiem: 100,
        buocGia: 10,
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if start date is after end date', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: dayAfterTomorrow,
        thoiGianKetThuc: tomorrow,
        giaKhoiDiem: 100,
        buocGia: 10,
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should create session successfully', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: tomorrow,
        thoiGianKetThuc: dayAfterTomorrow,
        giaKhoiDiem: 100,
        buocGia: 10,
        danhSachHinhAnh: ['img1.jpg', 'img2.jpg'],
      };

      const mockSession = { _id: 'session1', ...dto, chuPhienId: 'user1', trangThai: TrangThaiPhien.NHAP };
      sessionRepo.create.mockResolvedValue(mockSession);

      const res = await service.createSession('user1', dto as any);
      expect(res.tieuDe).toBe('Phien test');
      expect(res.danhSachHinhAnh).toEqual(['img1.jpg', 'img2.jpg']);
      expect(sessionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        danhSachHinhAnh: ['img1.jpg', 'img2.jpg'],
      }));
    });
  });

  describe('publishSession', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.publishSession('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should throw Forbidden if user is not creator', async () => {
      const session = { _id: 'session1', chuPhienId: 'user2', trangThai: TrangThaiPhien.NHAP };
      sessionRepo.getOne.mockResolvedValue(session);
      await expect(service.publishSession('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if session already published', async () => {
      const session = { _id: 'session1', chuPhienId: 'user1', trangThai: TrangThaiPhien.CONG_BO };
      sessionRepo.getOne.mockResolvedValue(session);
      await expect(service.publishSession('user1', 'session1')).rejects.toThrow(ApiError);
    });
  });

  describe('placeBid', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.placeBid('user1', { phienId: 'session1', giaDat: 200 })).rejects.toThrow(ApiError);
    });
  });

  describe('evaluateSession', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.evaluateSession('user1', 'session1')).rejects.toThrow(ApiError);
    });
  });

  describe('getSessionDetails', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getSessionDetails('session1')).rejects.toThrow(ApiError);
    });
  });

  describe('getSessionBids', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getSessionBids('user1', 'session1')).rejects.toThrow(ApiError);
    });
  });

  describe('getSessionStatus', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getSessionStatus('session1')).rejects.toThrow(ApiError);
    });

    it('should return session status data', async () => {
      const mockSession = { _id: 'session1', buocGia: 10, giaKhoiDiem: 100, giaCaoNhat: 150, trangThai: TrangThaiPhien.MO };
      sessionRepo.getOne.mockResolvedValue(mockSession);
      bidRepo.count.mockResolvedValue(5);
      bidRepo.getOne.mockResolvedValue(null);

      const res = await service.getSessionStatus('session1');
      expect(res.phienDauGiaId).toBe('session1');
      expect(res.tongSoLuotDat).toBe(5);
      expect(res.giaHienTai).toBe(150);
      expect(res.giaHopLeKeTiep).toBe(160);
    });
  });

  describe('closeSession', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.closeSession('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should throw Forbidden if user is not host', async () => {
      const mockSession = { _id: 'session1', chuPhienId: 'host2' };
      sessionRepo.getOne.mockResolvedValue(mockSession);
      await expect(service.closeSession('user1', 'session1')).rejects.toThrow(ApiError);
    });
  });

  describe('getRanking', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getRanking('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should return ranking representation', async () => {
      const mockSession = { _id: 'session1', trangThai: TrangThaiPhien.MO, anDanh: true, chuPhienId: 'host1' };
      const mockBids = [
        { _id: 'bid1', nguoiThamGiaId: 'user1', diemChuanHoaGia: 90, diemUyTin: 90, diemCamKet: 90, diemTongHop: 90, thuHang: 1, trangThai: TrangThaiDeXuat.THANG, giaDat: 1000, thoiDiemDat: new Date() },
        { _id: 'bid2', nguoiThamGiaId: 'user2', diemChuanHoaGia: 80, diemUyTin: 80, diemCamKet: 80, diemTongHop: 80, thuHang: 2, trangThai: TrangThaiDeXuat.THUA, giaDat: 900, thoiDiemDat: new Date() }
      ];
      sessionRepo.getOne.mockResolvedValue(mockSession);
      bidRepo.getMany.mockResolvedValue(mockBids);

      const res = await service.getRanking('user1', 'session1');
      expect(res.phienId).toBe('session1');
      expect(res.danhSach).toHaveLength(2);
      expect(res.danhSach[0].bietDanh).toBe('user1'); // self is exposed
      expect(res.danhSach[1].bietDanh).toBe('Bidder B'); // others anonymized
      expect(res.danhSach[0].diemUyTin).toBeUndefined();
      expect(res.danhSach[0].diemCamKet).toBeUndefined();
    });
  });
});
