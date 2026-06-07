import { Test, TestingModule } from '@nestjs/testing';
import { GiaoDichController } from './giao-dich.controller';
import { GiaoDichService } from '../services/giao-dich.service';

describe('GiaoDichController', () => {
  let controller: GiaoDichController;
  const mockService = {
    getPageMe: jest.fn().mockResolvedValue({ data: [] }),
    getChiTiet: jest.fn().mockResolvedValue({ _id: 'gd1' }),
    xacNhan: jest.fn().mockResolvedValue({}),
    tuChoi: jest.fn().mockResolvedValue({}),
    capNhatGhiChu: jest.fn().mockResolvedValue({}),
    baoDaChuyenKhoan: jest.fn().mockResolvedValue({}),
    xacNhanNhanTien: jest.fn().mockResolvedValue({}),
    hoanTat: jest.fn().mockResolvedValue({}),
    kyHopDong: jest.fn().mockResolvedValue({}),
    banGiao: jest.fn().mockResolvedValue({}),
    xacNhanNhan: jest.fn().mockResolvedValue({}),
    huy: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiaoDichController],
      providers: [{ provide: GiaoDichService, useValue: mockService }],
    }).compile();
    controller = module.get<GiaoDichController>(GiaoDichController);
  });

  afterEach(() => jest.clearAllMocks());

  it('getChiTiet truyền userId + role từ token', async () => {
    await controller.getChiTiet({ id: 'u1', role: 'USER' } as any, 'gd1');
    expect(mockService.getChiTiet).toHaveBeenCalledWith('u1', 'gd1', 'USER');
  });

  it('xacNhan delegate đúng', async () => {
    await controller.xacNhan({ id: 'winner1' } as any, 'gd1');
    expect(mockService.xacNhan).toHaveBeenCalledWith('winner1', 'gd1');
  });

  it('baoDaChuyenKhoan truyền dto', async () => {
    await controller.baoDaChuyenKhoan({ id: 'winner1' } as any, 'gd1', { anhChungTu: ['a.jpg'] } as any);
    expect(mockService.baoDaChuyenKhoan).toHaveBeenCalledWith('winner1', 'gd1', { anhChungTu: ['a.jpg'] });
  });
});
