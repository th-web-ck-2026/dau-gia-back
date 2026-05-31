import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from '../repositories/audit-log.repository';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: any;

  const mockAuditLogRepository = {
    create: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getPage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuditLogRepository,
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should successfully create an audit log with correct properties', async () => {
      const mockResult = {
        _id: 'some-uuid',
        nguoiThucHienId: 'user-1',
        hanhDong: 'TEST_ACTION',
        loaiDoiTuong: 'TestEntity',
        doiTuongId: 'entity-1',
        truocKhi: { status: 'OLD' },
        sauKhi: { status: 'NEW' },
        duLieuBoSung: { ip: '127.0.0.1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuditLogRepository.create.mockResolvedValue(mockResult);

      const result = await service.logAction(
        'user-1',
        'TEST_ACTION',
        'TestEntity',
        'entity-1',
        { status: 'OLD' },
        { status: 'NEW' },
        { ip: '127.0.0.1' },
      );

      expect(repository.create).toHaveBeenCalledWith({
        nguoiThucHienId: 'user-1',
        hanhDong: 'TEST_ACTION',
        loaiDoiTuong: 'TestEntity',
        doiTuongId: 'entity-1',
        truocKhi: { status: 'OLD' },
        sauKhi: { status: 'NEW' },
        duLieuBoSung: { ip: '127.0.0.1' },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
