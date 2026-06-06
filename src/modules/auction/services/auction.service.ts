import { Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { AuctionSession } from '../entities/auction-session.entity';
import { AuctionSessionRepository } from '../repositories/auction-session.repository';
import { AuctionBidRepository } from '../repositories/auction-bid.repository';
import { AuctionBid } from '../entities/auction-bid.entity';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { UserRoles } from '@/modules/user/common/constant';
import { CreateAuctionSessionDto } from '../dto/create-auction-session.dto';
import { PlaceAuctionBidDto } from '../dto/place-auction-bid.dto';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AuctionSessionStatusDto } from '../dto/auction-session-status.dto';
import { UserModel } from '@/modules/user/models/user.model';
import { AuctionBidModel } from '../models/auction-bid.model';
import { AuctionRankingResponse, AuctionRankingOrMessage } from '../dto/auction-ranking.dto';

@Injectable()
export class AuctionService extends BaseService<AuctionSession> implements OnModuleInit {
  constructor(
    private readonly auctionSessionRepository: AuctionSessionRepository,
    private readonly auctionBidRepository: AuctionBidRepository,
    private readonly scoringService: ScoringService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
    private readonly sequelize: Sequelize,
  ) {
    super(auctionSessionRepository);
  }

  async onModuleInit() {
    try {
      const sessions = await this.auctionSessionRepository.getMany();
      for (const session of sessions) {
        const count = await this.auctionBidRepository.count({
          where: { phienId: session._id },
          distinct: true,
          col: 'nguoiThamGiaId',
        } as any);
        if (session.soLuongNguoiThamGia !== count) {
          await this.auctionSessionRepository.updateOne(
            { soLuongNguoiThamGia: count },
            { where: { _id: session._id } },
          );
        }
      }
    } catch (error) {
      console.error('Failed to sync soLuongNguoiThamGia for auction sessions:', error);
    }
  }

  async checkAndTransitionStateInternal(session: AuctionSession): Promise<AuctionSession> {
    const now = new Date();
    const startTime = new Date(session.thoiGianBatDau);
    const endTime = new Date(session.thoiGianKetThuc);

    if (session.trangThai === TrangThaiPhien.CONG_BO && now >= startTime && now < endTime) {
      const affected = await this.auctionSessionRepository.updateAtomic(
        { trangThai: TrangThaiPhien.MO },
        { where: { _id: session._id, trangThai: TrangThaiPhien.CONG_BO } },
      );
      if (affected > 0) {
        session.trangThai = TrangThaiPhien.MO;
      }
    }

    if ((session.trangThai === TrangThaiPhien.MO || session.trangThai === TrangThaiPhien.CONG_BO) && now >= endTime) {
      const affected = await this.auctionSessionRepository.updateAtomic(
        { trangThai: TrangThaiPhien.DONG, thoiDiemDong: now },
        { where: { _id: session._id, trangThai: [TrangThaiPhien.MO, TrangThaiPhien.CONG_BO] } },
      );
      if (affected > 0) {
        session.trangThai = TrangThaiPhien.DONG;
        session.thoiDiemDong = now;
        await this.evaluateSession(null, session._id, true, true);
      }
    }

    return session;
  }

  async createSession(userId: string, dto: CreateAuctionSessionDto): Promise<AuctionSession> {
    const start = new Date(dto.thoiGianBatDau);
    const end = new Date(dto.thoiGianKetThuc);
    const now = new Date();
    if (start <= now) {
      throw ApiError.BadRequest('Thoi gian bat dau phai sau thoi gian hien tai');
    }
    if (end <= now) {
      throw ApiError.BadRequest('Thoi gian ket thuc phai sau thoi gian hien tai');
    }
    if (start >= end) {
      throw ApiError.BadRequest('Thoi gian bat dau phai truoc thoi gian ket thuc');
    }

    const session = await this.auctionSessionRepository.create({
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
      danhSachHinhAnh: dto.danhSachHinhAnh ?? [],
    });

    await this.auditLogService.logAction(userId, 'CREATE_AUCTION_SESSION', 'AuctionSession', session._id, null, session);

    return session;
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

    await this.auctionSessionRepository.updateOne(
      { trangThai: newStatus, thoiDiemCongBo: now },
      { where: { _id: sessionId } },
    );

    await this.auditLogService.logAction(
      userId,
      'PUBLISH_AUCTION_SESSION',
      'AuctionSession',
      sessionId,
      { trangThai: TrangThaiPhien.NHAP },
      { trangThai: newStatus },
    );

    return this.getSessionDetails(sessionId);
  }
  async placeBid(userId: string, dto: PlaceAuctionBidDto): Promise<AuctionBid> {
    let session = await this.auctionSessionRepository.getOne({ where: { _id: dto.phienId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    if (session.trangThai !== TrangThaiPhien.MO) {
      if (session.trangThai === TrangThaiPhien.DONG) {
        throw ApiError.BadRequest('Phien dau gia da dong');
      }
      throw ApiError.BadRequest('Phien dau gia khong trong trang thai nhan gia dat');
    }

    if (session.chuPhienId === userId) {
      throw ApiError.Forbidden('Chu phien khong duoc dat gia cho phien cua minh');
    }

    const bid = await this.sequelize.transaction(async (t) => {
      const lockedSession = await this.auctionSessionRepository.getOne({
        where: { _id: dto.phienId },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      } as any);

      if (lockedSession.giaTran && dto.giaDat > lockedSession.giaTran) {
        throw ApiError.BadRequest(
          `Gia dat vuot qua gia tran cua phien (${lockedSession.giaTran})`,
        );
      }

      const currentMax = Number(lockedSession.giaCaoNhat ?? lockedSession.giaKhoiDiem);
      const minRequiredBid =
        currentMax === Number(lockedSession.giaKhoiDiem) && !lockedSession.deXuatThangId
          ? Number(lockedSession.giaKhoiDiem)
          : currentMax + Number(lockedSession.buocGia);

      if (dto.giaDat < minRequiredBid) {
        throw new ConflictException({
          message: `Gia dat phai toi thieu la ${minRequiredBid}`,
          giaCaoNhat: currentMax,
          giaToiThieuKeTiep: minRequiredBid,
        });
      }

      const now = new Date();

      const newBid = await this.auctionBidRepository.create({
        phienId: dto.phienId,
        nguoiThamGiaId: userId,
        giaDat: dto.giaDat,
        diemUyTin: dto.diemUyTin ?? 100,
        diemCamKet: dto.diemCamKet ?? 100,
        trangThai: TrangThaiDeXuat.CHO_DUYET,
        thoiDiemDat: now,
      }, { transaction: t } as any);

      const uniqueParticipantsCount = await this.auctionBidRepository.count({
        where: { phienId: dto.phienId },
        distinct: true,
        col: 'nguoiThamGiaId',
        transaction: t,
      } as any);

      await this.auctionSessionRepository.updateOne(
        {
          giaCaoNhat: dto.giaDat,
          soLuongNguoiThamGia: uniqueParticipantsCount,
        },
        { where: { _id: lockedSession._id }, transaction: t } as any,
      );

      return newBid;
    });

    await this.auditLogService.logAction(userId, 'PLACE_AUCTION_BID', 'AuctionBid', bid._id, null, bid);

    try {
      const previousLeader = await this.auctionBidRepository.getOne({
        where: {
          phienId: dto.phienId,
          nguoiThamGiaId: { [Op.ne]: userId },
          _id: { [Op.ne]: bid._id },
        },
        order: [['giaDat', 'DESC']],
      });
      if (previousLeader) {
        await this.notificationService.createNotification({
          userIds: [previousLeader.nguoiThamGiaId],
          type: 'AUCTION_OUTBID',
          title: 'Bạn đã bị vượt giá',
          content: `Có người vừa đặt giá cao hơn bạn ở phiên "${session.tieuDe}".`,
          metadata: { phienId: session._id, bidId: bid._id, giaMoi: dto.giaDat },
        } as any);
      }
    } catch (err) {
      console.error('Failed to send AUCTION_OUTBID notification:', err);
    }

    return bid;
  }
  async evaluateSession(userId: string | null, sessionId: string, force = false, isSystem = false, userRole?: string): Promise<AuctionRankingOrMessage> {
    const session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    if (!isSystem && !isOwner && !isAdmin) {
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

    const highestBidPrice = Math.max(...bids.map((b) => Number(b.giaDat)));

<<<<<<< HEAD
=======
    // Step 2: Score all bids (only priceScore matters for final score)
>>>>>>> ranking-auc
    const scoredBids: any[] = [];
    for (const bid of bids) {
      const priceScore = this.scoringService.calculateAuctionPriceScore(Number(bid.giaDat), highestBidPrice);
      const finalScore = priceScore;

      scoredBids.push({
        bid,
        priceScore,
        finalScore,
      });
    }

    scoredBids.sort((a, b) => {
      if (Math.abs(b.finalScore - a.finalScore) > 1e-9) {
        return b.finalScore - a.finalScore;
      }
      return new Date(a.bid.thoiDiemDat).getTime() - new Date(b.bid.thoiDiemDat).getTime();
    });

    let rank = 1;
    let winnerUserId: string | null = null;
    const loserUserIds: string[] = [];
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
        winnerUserId = item.bid.nguoiThamGiaId;
      } else {
        loserUserIds.push(item.bid.nguoiThamGiaId);
      }
      rank++;
    }

<<<<<<< HEAD
    await this.auditLogService.logAction(userId, 'EVALUATE_AUCTION_SESSION', 'AuctionSession', sessionId, null, null);

    try {
      if (winnerUserId) {
        await this.notificationService.createNotification({
          userIds: [winnerUserId],
          type: 'AUCTION_WON',
          title: 'Bạn đã thắng phiên đấu giá',
          content: `Chúc mừng! Bạn đã thắng phiên "${session.tieuDe}".`,
          metadata: { phienId: sessionId },
        } as any);
      }
      if (loserUserIds.length > 0) {
        const uniqueLosers = Array.from(
          new Set(loserUserIds.filter((id) => id !== winnerUserId)),
        );
        if (uniqueLosers.length > 0) {
          await this.notificationService.createNotification({
            userIds: uniqueLosers,
            type: 'AUCTION_CLOSED',
            title: 'Phiên đấu giá đã kết thúc',
            content: `Phiên "${session.tieuDe}" đã kết thúc. Bạn không phải là người thắng.`,
            metadata: { phienId: sessionId },
          } as any);
        }
      }
    } catch (err) {
      console.error('Failed to send auction result notifications:', err);
    }

    return this.getSessionDetails(sessionId);
=======
    return this.getRanking(userId, sessionId);
>>>>>>> ranking-auc
  }

  async getSessionDetails(sessionId: string): Promise<AuctionSession> {
    let session = await this.auctionSessionRepository.getOne({
      where: { _id: sessionId },
      include: [
        { model: UserModel, as: 'chuPhien', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
        { model: AuctionBidModel, as: 'deXuatThang' },
      ],
    });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    session = await this.checkAndTransitionStateInternal(session);
    return session;
  }

  async getSessionBids(userId: string, sessionId: string, userRole?: string): Promise<AuctionBid[]> {
    let session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    const bids = await this.auctionBidRepository.getMany({
      where: { phienId: sessionId },
      order: [['giaDat', 'DESC']],
      include: [
        { model: UserModel, as: 'nguoiThamGia', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
      ],
    });

    return bids.map((bid) => {
      const plainBid = { ...bid } as any;
      if (session.anDanh && !isOwner && !isAdmin && bid.nguoiThamGiaId !== userId) {
        plainBid.nguoiThamGiaId = 'ANONYMOUS';
        plainBid.nguoiThamGia = null;
      }
      return plainBid;
    });
  }

  async getSessionStatus(sessionId: string): Promise<AuctionSessionStatusDto> {
    let session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    const count = await this.auctionBidRepository.count({ where: { phienId: sessionId } });

    let bietDanhNguoiDanDau = 'None';
    let leadingUserId = '';
    if (session.deXuatThangId) {
      const leadingBid = await this.auctionBidRepository.getOne({ where: { _id: session.deXuatThangId } });
      if (leadingBid) {
        leadingUserId = leadingBid.nguoiThamGiaId;
      }
    } else {
      const highestBid = await this.auctionBidRepository.getOne({
        where: { phienId: sessionId },
        order: [['giaDat', 'DESC']],
      });
      if (highestBid) {
        leadingUserId = highestBid.nguoiThamGiaId;
      }
    }

    if (leadingUserId) {
      if (session.anDanh) {
        bietDanhNguoiDanDau = `User_${leadingUserId.substring(0, 4)}`;
      } else {
        bietDanhNguoiDanDau = leadingUserId;
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
      soLuongNguoiThamGia: session.soLuongNguoiThamGia,
      buocGia: session.buocGia,
      giaHopLeKeTiep: minRequiredBid,
      thoiGianServer: new Date(),
      thoiGianKetThuc: session.thoiGianKetThuc,
      trangThai: session.trangThai,
    };
  }

<<<<<<< HEAD
  async closeSession(userId: string, sessionId: string, isSystem = false, userRole?: string): Promise<AuctionSession | { message: string }> {
=======
  async getRanking(userId: string, sessionId: string): Promise<AuctionRankingResponse> {
    let session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const bids = await this.auctionBidRepository.getMany({
      where: { phienId: sessionId },
      order: [['diemTongHop', 'DESC'], ['thoiDiemDat', 'ASC']],
    });

    const resultList = bids.map((bid, index) => {
      const isSelf = bid.nguoiThamGiaId === userId;
      let bietDanh = `Bidder ${String.fromCharCode(65 + index)}`;
      let participantId = bid.nguoiThamGiaId;
      if (session.anDanh && !isOwner && !isSelf) {
        participantId = 'ANONYMOUS';
      } else {
        bietDanh = bid.nguoiThamGiaId;
      }
      return {
        thuHang: bid.thuHang || index + 1,
        bidId: bid._id,
        nguoiThamGiaId: participantId,
        bietDanh,
        giaDat: bid.giaDat,
        diemGia: bid.diemChuanHoaGia,
        diemTongHop: bid.diemTongHop,
        trangThai: bid.trangThai,
        thoiDiemDat: bid.thoiDiemDat,
      };
    });

    return {
      phienId: session._id,
      trangThai: session.trangThai,
      danhSach: resultList,
    };
  }

  async closeSession(userId: string, sessionId: string, isSystem = false): Promise<AuctionRankingOrMessage> {
>>>>>>> ranking-auc
    let session = await this.auctionSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau gia khong ton tai');
    }
    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    if (!isSystem && !isOwner && !isAdmin) {
      throw ApiError.Forbidden('Ban khong co quyen dong phien nay');
    }
    if (session.trangThai === TrangThaiPhien.DONG) {
      throw ApiError.BadRequest('Phien da dong truoc do');
    }

    await this.auctionSessionRepository.updateOne(
      { trangThai: TrangThaiPhien.DONG, thoiDiemDong: new Date() },
      { where: { _id: sessionId } },
    );

    await this.auditLogService.logAction(
      userId,
      'CLOSE_AUCTION_SESSION',
      'AuctionSession',
      sessionId,
      { trangThai: session.trangThai },
      { trangThai: TrangThaiPhien.DONG },
    );

    return this.evaluateSession(userId, sessionId, true, isSystem, userRole);
  }
}