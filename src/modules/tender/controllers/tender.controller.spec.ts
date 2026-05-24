import { Test, TestingModule } from '@nestjs/testing';
import { TenderController } from './tender.controller';
import { TenderService } from '../services/tender.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';

describe('TenderController', () => {
  let controller: TenderController;
  let service: any;

  const mockTenderService = {
    createSession: jest.fn(),
    publishSession: jest.fn(),
    submitProposal: jest.fn(),
    evaluateSession: jest.fn(),
    getSessionDetails: jest.fn(),
    getSessionSubmissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenderController],
      providers: [
        { provide: TenderService, useValue: mockTenderService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TenderController>(TenderController);
    service = module.get<TenderService>(TenderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call service.createSession', async () => {
    const dto = { tieuDe: 'Test' };
    const user = { id: 'user1' };
    await controller.createSession(user as any, dto as any);
    expect(service.createSession).toHaveBeenCalledWith('user1', dto);
  });

  it('should call service.publishSession', async () => {
    const user = { id: 'user1' };
    await controller.publishSession(user as any, 'session1');
    expect(service.publishSession).toHaveBeenCalledWith('user1', 'session1');
  });

  it('should call service.submitProposal', async () => {
    const dto = { phienId: 'session1', giaDeXuat: 100, giaTriTieuChi: [] };
    const user = { id: 'user1' };
    await controller.submitProposal(user as any, dto);
    expect(service.submitProposal).toHaveBeenCalledWith('user1', dto);
  });

  it('should call service.evaluateSession', async () => {
    const user = { id: 'user1' };
    await controller.evaluateSession(user as any, 'session1');
    expect(service.evaluateSession).toHaveBeenCalledWith('user1', 'session1');
  });

  it('should call service.getSessionDetails', async () => {
    await controller.getSessionDetails('session1');
    expect(service.getSessionDetails).toHaveBeenCalledWith('session1');
  });

  it('should call service.getSessionSubmissions', async () => {
    const user = { id: 'user1' };
    await controller.getSessionSubmissions(user as any, 'session1');
    expect(service.getSessionSubmissions).toHaveBeenCalledWith('user1', 'session1');
  });
});
