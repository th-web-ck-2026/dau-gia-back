import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controller';
import { AuctionService } from '../services/auction.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';

describe('AuctionController', () => {
  let controller: AuctionController;
  let service: any;

  const mockAuctionService = {
    createSession: jest.fn(),
    publishSession: jest.fn(),
    placeBid: jest.fn(),
    evaluateSession: jest.fn(),
    getSessionDetails: jest.fn(),
    getSessionBids: jest.fn(),
    getPage: jest.fn(),
    getSessionStatus: jest.fn(),
    closeSession: jest.fn(),
    getRanking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionController],
      providers: [
        { provide: AuctionService, useValue: mockAuctionService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuctionController>(AuctionController);
    service = module.get<AuctionService>(AuctionService);
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

  it('should call service.placeBid', async () => {
    const dto = { phienId: '', giaDat: 200 };
    const user = { id: 'user1' };
    await controller.placeBid(user as any, 'session1', dto);
    expect(service.placeBid).toHaveBeenCalledWith('user1', { phienId: 'session1', giaDat: 200 });
  });

  it('should call service.evaluateSession', async () => {
    const user = { id: 'user1' };
    await controller.evaluateSession(user as any, 'session1');
    expect(service.evaluateSession).toHaveBeenCalledWith('user1', 'session1', false, false, undefined);
  });

  it('should call service.getSessionDetails', async () => {
    await controller.getSessionDetails('session1');
    expect(service.getSessionDetails).toHaveBeenCalledWith('session1');
  });

  it('should call service.getSessionBids', async () => {
    const user = { id: 'user1' };
    await controller.getSessionBids(user as any, 'session1');
    expect(service.getSessionBids).toHaveBeenCalledWith('user1', 'session1', undefined);
  });

  it('should call service.getPage', async () => {
    const query = { page: 1, limit: 10 };
    await controller.getSessions({}, query);
    expect(service.getPage).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, include: expect.any(Array) }),
      query,
    );
  });

  it('should call service.getSessionStatus', async () => {
    await controller.getSessionStatus('session1');
    expect(service.getSessionStatus).toHaveBeenCalledWith('session1');
  });

  it('should call service.closeSession', async () => {
    const user = { id: 'user1' };
    await controller.closeSession(user as any, 'session1');
    expect(service.closeSession).toHaveBeenCalledWith('user1', 'session1', false, undefined);
  });

  it('should call service.getRanking', async () => {
    const user = { id: 'user1' };
    await controller.getRanking(user as any, 'session1');
    expect(service.getRanking).toHaveBeenCalledWith('user1', 'session1');
  });
});
