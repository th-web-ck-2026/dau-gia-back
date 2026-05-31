import { Test, TestingModule } from '@nestjs/testing';
import { TenderService } from './tender.service';
import { TenderSessionRepository } from '../repositories/tender-session.repository';
import { TenderCriteriaRepository } from '../repositories/tender-criteria.repository';
import { TenderSubmissionRepository } from '../repositories/tender-submission.repository';
import { TenderSubmissionValueRepository } from '../repositories/tender-submission-value.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat, LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';

describe('TenderService', () => {
  let service: TenderService;
  let sessionRepo: any;
  let criteriaRepo: any;
  let submissionRepo: any;
  let submissionValueRepo: any;
  let auditLogService: any;

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
        {
          provide: AuditLogService,
          useValue: {
            logAction: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<TenderService>(TenderService);
    sessionRepo = module.get<TenderSessionRepository>(TenderSessionRepository);
    criteriaRepo = module.get<TenderCriteriaRepository>(TenderCriteriaRepository);
    submissionRepo = module.get<TenderSubmissionRepository>(TenderSubmissionRepository);
    submissionValueRepo = module.get<TenderSubmissionValueRepository>(TenderSubmissionValueRepository);
    auditLogService = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should throw BadRequest if start date is in the past', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2020-01-01T00:00:00.000Z',
        thoiGianKetThuc: '2026-06-02T00:00:00.000Z',
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if end date is in the past', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2026-06-01T00:00:00.000Z',
        thoiGianKetThuc: '2020-01-01T00:00:00.000Z',
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should throw BadRequest if start date is after end date', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2026-06-02T00:00:00.000Z',
        thoiGianKetThuc: '2026-06-01T00:00:00.000Z',
        tieuChi: [],
      };
      await expect(service.createSession('user1', dto as any)).rejects.toThrow(ApiError);
    });

    it('should create session and criteria successfully and log audit', async () => {
      const dto = {
        tieuDe: 'Phien test',
        thoiGianBatDau: '2026-06-01T00:00:00.000Z',
        thoiGianKetThuc: '2026-06-02T00:00:00.000Z',
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
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'user1',
        'CREATE_TENDER_SESSION',
        'TenderSession',
        'session1',
        null,
        mockSession,
      );
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

    it('should publish draft session and log audit', async () => {
      const session = {
        _id: 'session1',
        chuPhienId: 'user1',
        trangThai: TrangThaiPhien.NHAP,
        thoiGianBatDau: new Date(),
        thoiGianKetThuc: new Date(Date.now() + 10000),
      };
      const mockResult = { ...session, trangThai: TrangThaiPhien.MO };
      sessionRepo.getOne.mockResolvedValue(session);
      sessionRepo.updateOne.mockResolvedValue(mockResult);

      await service.publishSession('user1', 'session1');
      expect(sessionRepo.updateOne).toHaveBeenCalled();
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'user1',
        'PUBLISH_TENDER_SESSION',
        'TenderSession',
        'session1',
        { trangThai: TrangThaiPhien.NHAP },
        { trangThai: TrangThaiPhien.MO },
      );
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

    it('should submit proposal successfully and log audit', async () => {
      const session = {
        _id: 'session1',
        trangThai: TrangThaiPhien.MO,
        giaToiDa: 1000,
        thoiGianBatDau: new Date(Date.now() - 10000),
        thoiGianKetThuc: new Date(Date.now() + 10000),
        chuPhienId: 'host1',
      };
      const mockSubmission = {
        _id: 'sub1',
        phienId: 'session1',
        nguoiThamGiaId: 'user1',
        giaDeXuat: 800,
      };
      sessionRepo.getOne.mockResolvedValue(session);
      submissionRepo.create.mockResolvedValue(mockSubmission);
      submissionValueRepo.create.mockResolvedValue({});

      const dto = { phienId: 'session1', giaDeXuat: 800, giaTriTieuChi: [] };
      const res = await service.submitProposal('user1', dto);

      expect(res).toEqual(mockSubmission);
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'user1',
        'SUBMIT_TENDER_PROPOSAL',
        'TenderSubmission',
        'sub1',
        null,
        mockSubmission,
      );
    });
  });

  describe('evaluateSession', () => {
    it('should throw NotFound if session does not exist', async () => {
      sessionRepo.getOne.mockResolvedValue(null);
      await expect(service.evaluateSession('user1', 'session1')).rejects.toThrow(ApiError);
    });

    it('should evaluate session and select winner, then log audit', async () => {
      const session = {
        _id: 'session1',
        trangThai: TrangThaiPhien.MO,
        chuPhienId: 'user1',
        thoiGianBatDau: new Date(Date.now() - 20000),
        thoiGianKetThuc: new Date(Date.now() - 10000),
        diemKyThuatToiThieu: 0,
        trongSoKyThuat: 0.7,
        trongSoGia: 0.3,
      };

      const mockSubmission = {
        _id: 'sub1',
        phienId: 'session1',
        nguoiThamGiaId: 'user2',
        giaDeXuat: 100,
        trangThai: TrangThaiDeXuat.HOP_LE,
      };

      const mockCriteria = [
        {
          _id: 'cri1',
          phienId: 'session1',
          tenTieuChi: 'Price',
          maTieuChi: 'PRICE',
          nhom: 'ky_thuat',
          loai: LoaiTieuChi.SO,
          trongSo: 1.0,
          huongToiUu: HuongToiUu.THAP_HON,
        },
      ];

      const mockSubmissionValues = [
        {
          _id: 'val1',
          deXuatId: 'sub1',
          tieuChiId: 'cri1',
          giaTriSo: 100,
        },
      ];

      sessionRepo.getOne.mockResolvedValue(session);
      criteriaRepo.getMany.mockResolvedValue(mockCriteria);
      submissionRepo.getMany.mockResolvedValue([mockSubmission]);
      submissionValueRepo.getMany.mockResolvedValue(mockSubmissionValues);
      submissionValueRepo.updateOne.mockResolvedValue({});
      submissionRepo.updateOne.mockResolvedValue({});

      const res = await service.evaluateSession('user1', 'session1');

      expect(res).toBeDefined();
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'user1',
        'EVALUATE_TENDER_SESSION',
        'TenderSession',
        'session1',
        null,
        null,
      );
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
      const mockSession = { _id: 'session1', trangThai: TrangThaiPhien.DONG, anDanh: true, chuPhienId: 'host1' };
      const mockSubmissions = [
        { _id: 'sub1', nguoiThamGiaId: 'user1', diemTongHop: 90, thuHang: 1, trangThai: TrangThaiDeXuat.HOP_LE },
        { _id: 'sub2', nguoiThamGiaId: 'user2', diemTongHop: 80, thuHang: 2, trangThai: TrangThaiDeXuat.HOP_LE }
      ];
      sessionRepo.getOne.mockResolvedValue(mockSession);
      submissionRepo.getMany.mockResolvedValue(mockSubmissions);

      const res = await service.getRanking('user1', 'session1');
      expect(res.phienId).toBe('session1');
      expect(res.danhSach).toHaveLength(2);
      expect(res.danhSach[0].nguoiThamGiaId).toBe('user1'); // self is exposed
      expect(res.danhSach[1].nguoiThamGiaId).toBe('ANONYMOUS'); // others anonymized
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

    it('should close session successfully and log audit', async () => {
      const mockSession = { _id: 'session1', trangThai: TrangThaiPhien.MO, chuPhienId: 'host1' };
      sessionRepo.getOne.mockResolvedValue(mockSession);
      sessionRepo.updateOne.mockResolvedValue({ ...mockSession, trangThai: TrangThaiPhien.DONG });
      submissionRepo.getMany.mockResolvedValue([]);

      // Stub evaluateSession since closeSession delegates to it
      jest.spyOn(service, 'evaluateSession').mockResolvedValue(mockSession as any);

      const res = await service.closeSession('host1', 'session1');
      expect(res).toBeDefined();
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'host1',
        'CLOSE_TENDER_SESSION',
        'TenderSession',
        'session1',
        { trangThai: TrangThaiPhien.MO },
        { trangThai: TrangThaiPhien.DONG },
      );
    });
  });
});
