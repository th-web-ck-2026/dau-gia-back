import { Test, TestingModule } from '@nestjs/testing';
import { TenderService } from './tender.service';
import { TenderSessionRepository } from '../repositories/tender-session.repository';
import { TenderCriteriaRepository } from '../repositories/tender-criteria.repository';
import { TenderSubmissionRepository } from '../repositories/tender-submission.repository';
import { TenderSubmissionValueRepository } from '../repositories/tender-submission-value.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat, LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';

describe('TenderService', () => {
  let service: TenderService;
  let sessionRepo: any;
  let criteriaRepo: any;
  let submissionRepo: any;
  let submissionValueRepo: any;

  const mockSessionRepo = {
    create: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    updateOne: jest.fn(),
    updateAtomic: jest.fn(),
  };

  const mockCriteriaRepo = {
    create: jest.fn(),
    getMany: jest.fn(),
  };

  const mockSubmissionRepo = {
    create: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockSubmissionValueRepo = {
    create: jest.fn(),
    getMany: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenderService,
        ScoringService,
        { provide: TenderSessionRepository, useValue: mockSessionRepo },
        { provide: TenderCriteriaRepository, useValue: mockCriteriaRepo },
        { provide: TenderSubmissionRepository, useValue: mockSubmissionRepo },
        { provide: TenderSubmissionValueRepository, useValue: mockSubmissionValueRepo },
      ],
    }).compile();

    service = module.get<TenderService>(TenderService);
    sessionRepo = module.get<TenderSessionRepository>(TenderSessionRepository);
    criteriaRepo = module.get<TenderCriteriaRepository>(TenderCriteriaRepository);
    submissionRepo = module.get<TenderSubmissionRepository>(TenderSubmissionRepository);
    submissionValueRepo = module.get<TenderSubmissionValueRepository>(TenderSubmissionValueRepository);
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
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if end date is in the past', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        thoiGianKetThuc: '2020-01-01T00:00:00.000Z',
        tieuChi: [],
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
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should create session and criteria successfully', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: tomorrow,
        thoiGianKetThuc: dayAfterTomorrow,
        danhSachHinhAnh: ['img1.jpg', 'img2.jpg'],
        tieuChi: [
          {
            tenTieuChi: 'Tieu chi 1',
            maTieuChi: 'TC1',
            nhom: 'ky_thuat' as any,
            loai: LoaiTieuChi.SO,
            trongSo: 1.0,
            huongToiUu: HuongToiUu.CAO_HON,
            batBuoc: true,
            rangBuocCung: false,
          },
        ],
      };

      const mockSession = {
        _id: 'session1',
        ...dto,
        chuPhienId: 'user1',
        trangThai: TrangThaiPhien.NHAP,
      };
      sessionRepo.create.mockResolvedValue(mockSession);
      sessionRepo.getOne.mockResolvedValue(mockSession);
      criteriaRepo.create.mockResolvedValue({});
      criteriaRepo.getMany.mockResolvedValue(dto.tieuChi);

      const res = await service.createSession('user1', dto as any);
      expect(res.tieuDe).toBe('Phien test');
      expect(res.danhSachHinhAnh).toEqual(['img1.jpg', 'img2.jpg']);
      expect(sessionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        danhSachHinhAnh: ['img1.jpg', 'img2.jpg'],
      }));
      expect(criteriaRepo.create).toHaveBeenCalled();
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

    it('should publish draft session', async () => {
      const session = {
        _id: 'session1',
        chuPhienId: 'user1',
        trangThai: TrangThaiPhien.NHAP,
        thoiGianBatDau: new Date(),
        thoiGianKetThuc: new Date(Date.now() + 10000),
      };
      sessionRepo.getOne.mockResolvedValue(session);
      sessionRepo.updateOne.mockResolvedValue({ ...session, trangThai: TrangThaiPhien.MO });

      const res = await service.publishSession('user1', 'session1');
      expect(sessionRepo.updateOne).toHaveBeenCalled();
    });
  });

  describe('submitProposal', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.submitProposal('user1', { phienId: 'session1' } as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if proposal price exceeds ceiling price', async () => {
      const session = {
        _id: 'session1',
        trangThai: TrangThaiPhien.MO,
        giaToiDa: 1000,
        thoiGianBatDau: new Date(Date.now() - 10000),
        thoiGianKetThuc: new Date(Date.now() + 10000),
      };
      sessionRepo.getOne.mockResolvedValue(session);
      await expect(
        service.submitProposal('user1', { phienId: 'session1', giaDeXuat: 1200, giaTriTieuChi: [] }),
      ).rejects.toThrow(ApiError);
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

  describe('getSessionSubmissions', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getSessionSubmissions('user1', 'session1')).rejects.toThrow(ApiError);
    });
  });

  describe('getRanking', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.getRanking('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should return ranking representation', async () => {
      const mockSession = { _id: 'session1', trangThai: TrangThaiPhien.MO, anDanh: true, chuPhienId: 'host1' };
      const mockSubmissions = [
        { _id: 'sub1', nguoiThamGiaId: 'user1', diemTongHop: 90, thuHang: 1, trangThai: TrangThaiDeXuat.HOP_LE },
        { _id: 'sub2', nguoiThamGiaId: 'user2', diemTongHop: 80, thuHang: 2, trangThai: TrangThaiDeXuat.HOP_LE }
      ];
      sessionRepo.getOne.mockResolvedValue(mockSession);
      submissionRepo.getMany.mockResolvedValue(mockSubmissions);

      const res = await service.getRanking('user1', 'session1');
      expect(res.phienId).toBe('session1');
      expect(res.danhSach).toHaveLength(2);
      expect(res.danhSach[0].bietDanh).toBe('user1'); // self is exposed
      expect(res.danhSach[1].bietDanh).toBe('Bidder B'); // others anonymized
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
});
