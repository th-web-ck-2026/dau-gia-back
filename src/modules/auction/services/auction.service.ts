import { Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { AuctionSession } from '../entities/auction-session.entity';
import { AuctionSessionRepository } from '../repositories/auction-session.repository';
import { AuctionBidRepository } from '../repositories/auction-bid.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { CreateAuctionSessionDto } from '../dto/create-auction-session.dto';
import { PlaceAuctionBidDto } from '../dto/place-auction-bid.dto';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { AuctionSessionStatusDto } from '../dto/auction-session-status.dto';

@Injectable()
export class AuctionService extends BaseService<AuctionSession> {
  constructor(
    private readonly auctionSessionRepository: AuctionSessionRepository,
    private readonly auctionBidRepository: AuctionBidRepository,
    private readonly scoringService: ScoringService,
  ) {
    super(auctionSessionRepository);
  }

  async createSession(userId: string, dto: CreateAuctionSessionDto): Promise<AuctionSession> {
    const start = new Date(dto.thoiGianBatDau);
    const end = new Date(dto.thoiGianKetThuc);
    if (start >= end) {
      throw ApiError.BadRequest('Thoi gian bat dau phai truoc thoi gian ket thuc');
    }

    return this.auctionSessionRepository.create({
      tieuDe: dto.tieuDe,
      moTa: dto.moTa,
      chuPhienId: userId,
      trangThai: TrangThaiPhien.NHAP,
      thoiGianBatDau: start,
      thoiGianKetThuc: end,
      giaKhoiDiem: dto.giaKhoiDiem,
      buocGia: dto.buocGia,
      giaTran: dto.giaTran,
      trongSoGia: dto.trongSoGia ?? 0.8,
      trongSoUyTin: dto.trongSoUyTin ?? 0.2,
      trongSoCamKet: dto.trongSoCamKet ?? 0.0,
      giaCaoNhat: dto.giaKhoiDiem,
      anDanh: dto.anDanh ?? false,
    });
  }

  async publishSession(userId: string, sessionId: string): Promise<AuctionSession> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    if (session.chuPhienId !== userId) {
      throw ApiError.Forbidden('Ban khong co quyen xuat ban phien nay');
    }
    if (session.trangThai !== TrangThaiPhien.NHAP) {
      throw ApiError.BadRequest('Phien da duoc xuat ban truoc do');
    }

    const now = new Date();
    let newStatus = TrangThaiPhien.CONG_BO;
    if (now >= new Date(session.thoiGianBatDau) && now < new Date(session.thoiGianKetThuc)) {
      newStatus = TrangThaiPhien.MO;
    }

    return this.auctionSessionRepository.updateOne(
      { trangThai: newStatus, thoiDiemCongBo: now },
      { where: { _id: sessionId } },
    ).then(() => this.getSessionDetails(sessionId));
  }

  async placeBid(userId: string, dto: PlaceAuctionBidDto): Promise<any> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: dto.phienId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    const now = new Date();
    if (session.trangThai === TrangThaiPhien.NHAP || session.trangThai === TrangThaiPhien.CONG_BO) {
      if (now >= new Date(session.thoiGianBatDau) && now < new Date(session.thoiGianKetThuc)) {
        await this.auctionSessionRepository.updateOne({ trangThai: TrangThaiPhien.MO }, { where: { _id: session._id } });
        session.trangThai = TrangThaiPhien.MO;
      } else {
        throw ApiError.BadRequest('Phien dau gia chua den thoi gian nhan gia dat');
      }
    }

    if (now > new Date(session.thoiGianKetThuc)) {
      if (session.trangThai === TrangThaiPhien.MO) {
        await this.auctionSessionRepository.updateOne({ trangThai: TrangThaiPhien.DONG }, { where: { _id: session._id } });
      }
      throw ApiError.BadRequest('Phien dau gia da dong');
    }

    if (session.trangThai !== TrangThaiPhien.MO) {
      throw ApiError.BadRequest('Phien dau gia khong trong trang thai nhan gia dat');
    }

    if (session.giaTran && dto.giaDat > session.giaTran) {
      throw ApiError.BadRequest(`Gia dat vuot qua gia tran cua phien (${session.giaTran})`);
    }

    // Step verification
    const currentMax = Number(session.giaCaoNhat ?? session.giaKhoiDiem);
    const minRequiredBid = currentMax === Number(session.giaKhoiDiem) && !session.deXuatThangId
      ? Number(session.giaKhoiDiem)
      : currentMax + Number(session.buocGia);

    if (dto.giaDat < minRequiredBid) {
      throw ApiError.BadRequest(`Gia dat phai toi thieu la ${minRequiredBid}`);
    }

    const bid = await this.auctionBidRepository.create({
      phienId: dto.phienId,
      nguoiThamGiaId: userId,
      giaDat: dto.giaDat,
      diemUyTin: dto.diemUyTin ?? 100,
      diemCamKet: dto.diemCamKet ?? 100,
      trangThai: TrangThaiDeXuat.CHO_DUYET,
      thoiDiemDat: now,
    });

    await this.auctionSessionRepository.updateOne(
      { giaCaoNhat: dto.giaDat },
      { where: { _id: session._id } },
    );

    return bid;
  }

  async evaluateSession(userId: string, sessionId: string, force = false): Promise<AuctionSession | { message: string }> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    if (session.chuPhienId !== userId) {
      throw ApiError.Forbidden('Ban khong co quyen danh gia phien nay');
    }

    const now = new Date();
    if (!force && now < new Date(session.thoiGianKetThuc)) {
      throw ApiError.BadRequest('Phien dau gia van dang trong thoi gian dien ra');
    }

    if (session.trangThai === TrangThaiPhien.MO) {
      await this.auctionSessionRepository.updateOne({ trangThai: TrangThaiPhien.DONG }, { where: { _id: sessionId } });
      session.trangThai = TrangThaiPhien.DONG;
    }

    const bids = await this.auctionBidRepository.getMany({ where: { phienId: sessionId } });
    if (bids.length === 0) {
      return { message: 'Khong co luot dat gia nao de danh gia' };
    }

    // Step 1: Find highest bid Gmax
    const highestBidPrice = Math.max(...bids.map((b) => Number(b.giaDat)));

    // Step 2: Score all bids
    const scoredBids: any[] = [];
    for (const bid of bids) {
      const priceScore = this.scoringService.calculateAuctionPriceScore(Number(bid.giaDat), highestBidPrice);
      const finalScore = this.scoringService.calculateAuctionFinalScore(
        priceScore,
        bid.diemUyTin,
        bid.diemCamKet ?? 0,
        {
          trongSoGia: session.trongSoGia,
          trongSoUyTin: session.trongSoUyTin,
          trongSoCamKet: session.trongSoCamKet,
        },
      );

      scoredBids.push({
        bid,
        priceScore,
        finalScore,
      });
    }

    // Sort by final score desc, then by bid timestamp asc (earlier is better in case of tie)
    scoredBids.sort((a, b) => {
      if (Math.abs(b.finalScore - a.finalScore) > 1e-9) {
        return b.finalScore - a.finalScore;
      }
      return new Date(a.bid.thoiDiemDat).getTime() - new Date(b.bid.thoiDiemDat).getTime();
    });

    let rank = 1;
    for (const item of scoredBids) {
      const isWinner = rank === 1;
      await this.auctionBidRepository.updateOne(
        {
          trangThai: isWinner ? TrangThaiDeXuat.THANG : TrangThaiDeXuat.THUA,
          diemChuanHoaGia: item.priceScore,
          diemTongHop: item.finalScore,
          thuHang: rank,
        },
        { where: { _id: item.bid._id } },
      );

      if (isWinner) {
        await this.auctionSessionRepository.updateOne(
          { deXuatThangId: item.bid._id },
          { where: { _id: sessionId } },
        );
      }
      rank++;
    }

    return this.getSessionDetails(sessionId);
  }

  async getSessionDetails(sessionId: string): Promise<AuctionSession> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    return session;
  }

  async getSessionBids(userId: string, sessionId: string): Promise<any[]> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    const isOwner = session.chuPhienId === userId;
    const bids = await this.auctionBidRepository.getMany({
      where: { phienId: sessionId },
      order: [['giaDat', 'DESC']],
    });

    return bids.map((bid) => {
      const plainBid = { ...bid } as any;
      if (session.anDanh && !isOwner && bid.nguoiThamGiaId !== userId) {
        plainBid.nguoiThamGiaId = 'ANONYMOUS';
      }
      return plainBid;
    });
  }

  async getSessionStatus(sessionId: string): Promise<AuctionSessionStatusDto> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    const count = await this.auctionBidRepository.count({ where: { phienId: sessionId } });
    
    let bietDanhNguoiDanDau = 'None';
    if (session.deXuatThangId) {
      const leadingBid = await this.auctionBidRepository.getOne({ where: { _id: session.deXuatThangId } });
      if (leadingBid) {
        bietDanhNguoiDanDau = leadingBid.nguoiThamGiaId;
      }
    } else {
      const highestBid = await this.auctionBidRepository.getOne({
        where: { phienId: sessionId },
        order: [['giaDat', 'DESC']],
      });
      if (highestBid) {
        bietDanhNguoiDanDau = highestBid.nguoiThamGiaId;
      }
    }

    const currentMax = Number(session.giaCaoNhat ?? session.giaKhoiDiem);
    const minRequiredBid = currentMax === Number(session.giaKhoiDiem) && !session.deXuatThangId
      ? Number(session.giaKhoiDiem)
      : currentMax + Number(session.buocGia);

    return {
      phienDauGiaId: session._id,
      giaHienTai: currentMax,
      bietDanhNguoiDanDau,
      tongSoLuotDat: count,
      buocGia: session.buocGia,
      giaHopLeKeTiep: minRequiredBid,
      thoiGianServer: new Date(),
      thoiGianKetThuc: session.thoiGianKetThuc,
      trangThai: session.trangThai,
    };
  }

  async closeSession(userId: string, sessionId: string): Promise<AuctionSession | { message: string }> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    if (session.chuPhienId !== userId) {
      throw ApiError.Forbidden('Ban khong co quyen dong phien nay');
    }
    if (session.trangThai === TrangThaiPhien.DONG) {
      throw ApiError.BadRequest('Phien da dong truoc do');
    }

    await this.auctionSessionRepository.updateOne(
      { trangThai: TrangThaiPhien.DONG, thoiDiemDong: new Date() },
      { where: { _id: sessionId } },
    );

    return this.evaluateSession(userId, sessionId, true);
  }
}
