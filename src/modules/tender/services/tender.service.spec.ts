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
    it('should throw BadRequest if start date is after end date', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2026-06-02T00:00:00.000Z',
        thoiGianKetThuc: '2026-06-01T00:00:00.000Z',
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should create session and criteria successfully', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2026-06-01T00:00:00.000Z',
        thoiGianKetThuc: '2026-06-02T00:00:00.000Z',
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
      expect(sessionRepo.create).toHaveBeenCalled();
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
});
