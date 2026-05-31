import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from '../services/audit-log.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: any;

  const mockAuditLogService = {
    getPage: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLogs', () => {
    it('should call auditLogService.getPage with correct parameters', async () => {
      const mockResult = {
        page: 1,
        limit: 10,
        total: 1,
        offset: 0,
        result: [],
      };
      mockAuditLogService.getPage.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 10 } as any;
      const result = await controller.getLogs(query);

      expect(service.getPage).toHaveBeenCalledWith({}, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createLog', () => {
    it('should call auditLogService.create with correct dto', async () => {
      const dto = {
        nguoiThucHienId: 'user-1',
        hanhDong: 'MANUAL_LOG',
        loaiDoiTuong: 'Manual',
        doiTuongId: 'manual-1',
      };
      const mockResult = { _id: 'uuid', ...dto };
      mockAuditLogService.create.mockResolvedValue(mockResult);

      const result = await controller.createLog(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });
});
