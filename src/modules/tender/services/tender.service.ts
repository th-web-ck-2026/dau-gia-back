import { Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { TenderSession, TenderSessionDetails } from '../entities/tender-session.entity';
import { TenderSessionRepository } from '../repositories/tender-session.repository';
import { TenderCriteriaRepository } from '../repositories/tender-criteria.repository';
import { TenderSubmissionRepository } from '../repositories/tender-submission.repository';
import { TenderSubmission, TenderSubmissionDetails } from '../entities/tender-submission.entity';
import { TenderSubmissionValueRepository } from '../repositories/tender-submission-value.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { UserRoles } from '@/modules/user/common/constant';
import { CreateTenderSessionDto } from '../dto/create-tender-session.dto';
import { SubmitTenderProposalDto } from '../dto/submit-tender-proposal.dto';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat, LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';
import { Op } from 'sequelize';
import { UserModel } from '@/modules/user/models/user.model';
import { TenderCriteriaModel } from '../models/tender-criteria.model';
import { TenderSubmissionModel } from '../models/tender-submission.model';
import { TenderSubmissionValueModel } from '../models/tender-submission-value.model';

@Injectable()
export class TenderService extends BaseService<TenderSession> {
  constructor(
    private readonly tenderSessionRepository: TenderSessionRepository,
    private readonly tenderCriteriaRepository: TenderCriteriaRepository,
    private readonly tenderSubmissionRepository: TenderSubmissionRepository,
    private readonly tenderSubmissionValueRepository: TenderSubmissionValueRepository,
    private readonly scoringService: ScoringService,
    private readonly auditLogService: AuditLogService,
  ) {
    super(tenderSessionRepository);
  }

  async checkAndTransitionStateInternal(session: TenderSession): Promise<TenderSession> {
    const now = new Date();
    const startTime = new Date(session.thoiGianBatDau);
    const endTime = new Date(session.thoiGianKetThuc);

    if (session.trangThai === TrangThaiPhien.CONG_BO && now >= startTime && now < endTime) {
      const affected = await this.tenderSessionRepository.updateAtomic(
        { trangThai: TrangThaiPhien.MO },
        { where: { _id: session._id, trangThai: TrangThaiPhien.CONG_BO } },
      );
      if (affected > 0) {
        session.trangThai = TrangThaiPhien.MO;
      }
    }

    if ((session.trangThai === TrangThaiPhien.MO || session.trangThai === TrangThaiPhien.CONG_BO) && now >= endTime) {
      const affected = await this.tenderSessionRepository.updateAtomic(
        { trangThai: TrangThaiPhien.DONG, thoiDiemDong: now },
        { where: { _id: session._id, trangThai: [TrangThaiPhien.MO, TrangThaiPhien.CONG_BO] } },
      );
      if (affected > 0) {
        session.trangThai = TrangThaiPhien.DONG;
        session.thoiDiemDong = now;
        await this.evaluateSession('SYSTEM', session._id, true, true);

        const submissions = await this.tenderSubmissionRepository.getMany({
          where: { phienId: session._id },
        });
        for (const sub of submissions) {
          if (sub.trangThai === TrangThaiDeXuat.HOP_LE) {
            await this.tenderSubmissionRepository.updateOne(
              { trangThai: TrangThaiDeXuat.THUA },
              { where: { _id: sub._id } },
            );
          }
        }
      }
    }

    return session;
  }

  async createSession(userId: string, dto: CreateTenderSessionDto): Promise<TenderSessionDetails> {
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

    const session = await this.tenderSessionRepository.create({
      tieuDe: dto.tieuDe,
      moTa: dto.moTa,
      chuPhienId: userId,
      trangThai: TrangThaiPhien.NHAP,
      thoiGianBatDau: start,
      thoiGianKetThuc: end,
      giaToiDa: dto.giaToiDa,
      trongSoKyThuat: dto.trongSoKyThuat ?? 0.6,
      trongSoGia: dto.trongSoGia ?? 0.4,
      diemKyThuatToiThieu: dto.diemKyThuatToiThieu ?? 50,
      anDanh: dto.anDanh ?? false,
      danhSachHinhAnh: dto.danhSachHinhAnh ?? [],
    });

    for (const cri of dto.tieuChi) {
      await this.tenderCriteriaRepository.create({
        phienId: session._id,
        tenTieuChi: cri.tenTieuChi,
        maTieuChi: cri.maTieuChi,
        nhom: cri.nhom,
        loai: cri.loai,
        trongSo: cri.trongSo,
        huongToiUu: cri.huongToiUu,
        batBuoc: cri.batBuoc,
        rangBuocCung: cri.rangBuocCung,
        cacLuaChon: cri.cacLuaChon,
        giaTriToiThieu: cri.giaTriToiThieu,
        giaTriToiDa: cri.giaTriToiDa,
        donVi: cri.donVi,
      });
    }

    await this.auditLogService.logAction(userId, 'CREATE_TENDER_SESSION', 'TenderSession', session._id, null, session);

    return this.getSessionDetails(session._id);
  }

  async publishSession(userId: string, sessionId: string): Promise<TenderSessionDetails> {
    const session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
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

    await this.tenderSessionRepository.updateOne(
      { trangThai: newStatus, thoiDiemCongBo: now },
      { where: { _id: sessionId } },
    );

    await this.auditLogService.logAction(
      userId,
      'PUBLISH_TENDER_SESSION',
      'TenderSession',
      sessionId,
      { trangThai: TrangThaiPhien.NHAP },
      { trangThai: newStatus },
    );

    return this.getSessionDetails(sessionId);
  }

  async submitProposal(userId: string, dto: SubmitTenderProposalDto): Promise<TenderSubmission> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: dto.phienId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    if (session.trangThai !== TrangThaiPhien.MO) {
      if (session.trangThai === TrangThaiPhien.DONG) {
        throw ApiError.BadRequest('Phien dau thau da dong');
      }
      throw ApiError.BadRequest('Phien dau thau khong trong trang thai nhan de xuat');
    }

    if (session.chuPhienId === userId) {
      throw ApiError.Forbidden('Chu phien khong duoc nop de xuat cho phien cua minh');
    }

    if (session.giaToiDa && dto.giaDeXuat > session.giaToiDa) {
      throw ApiError.BadRequest(`Gia de xuat vuot qua gia tran cua phien (${session.giaToiDa})`);
    }

    const existing = await this.tenderSubmissionRepository.getOne({
      where: { phienId: dto.phienId, nguoiThamGiaId: userId },
    });
    if (existing) {
      throw ApiError.Conflict('Ban da nop de xuat cho phien nay roi');
    }

    const criteriaList = await this.tenderCriteriaRepository.getMany({
      where: { phienId: dto.phienId },
    });

    const criteriaMap = new Map(criteriaList.map((c) => [c._id, c]));

    for (const valDto of dto.giaTriTieuChi) {
      const criteria = criteriaMap.get(valDto.tieuChiId);
      if (!criteria) {
        throw ApiError.BadRequest(`Tieu chi ID "${valDto.tieuChiId}" khong thuoc phien nay`);
      }

      if (criteria.batBuoc && (valDto.giaTriGoc === undefined || valDto.giaTriGoc === null || valDto.giaTriGoc === '')) {
        throw ApiError.BadRequest(`Tieu chi "${criteria.tenTieuChi}" la bat buoc`);
      }
    }

    const now = new Date();
    const submission = await this.tenderSubmissionRepository.create({
      phienId: dto.phienId,
      nguoiThamGiaId: userId,
      trangThai: TrangThaiDeXuat.CHO_DUYET,
      giaDeXuat: dto.giaDeXuat,
      thoiDiemNop: now,
    });

    for (const valDto of dto.giaTriTieuChi) {
      const criteria = criteriaMap.get(valDto.tieuChiId);
      let giaTriSo: number | undefined;
      let giaTriChuoi: string | undefined;
      let giaTriDungSai: boolean | undefined;

      if (criteria.loai === LoaiTieuChi.SO || criteria.loai === LoaiTieuChi.PHAN_TRAM) {
        giaTriSo = Number(valDto.giaTriGoc);
      } else if (criteria.loai === LoaiTieuChi.DUNG_SAI) {
        giaTriDungSai = Boolean(valDto.giaTriGoc);
      } else {
        giaTriChuoi = String(valDto.giaTriGoc);
      }

      await this.tenderSubmissionValueRepository.create({
        deXuatId: submission._id,
        tieuChiId: valDto.tieuChiId,
        giaTriSo,
        giaTriChuoi,
        giaTriDungSai,
        giaTriGoc: valDto.giaTriGoc,
      });
    }

    await this.auditLogService.logAction(userId, 'SUBMIT_TENDER_PROPOSAL', 'TenderSubmission', submission._id, null, submission);

    return submission;
  }

  async evaluateSession(userId: string, sessionId: string, force = false, isSystem = false, userRole?: string): Promise<TenderSessionDetails | { message: string }> {
    const session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }
    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    if (!isSystem && !isOwner && !isAdmin) {
      throw ApiError.Forbidden('Ban khong co quyen danh gia phien nay');
    }

    const now = new Date();
    if (!force && now < new Date(session.thoiGianKetThuc)) {
      throw ApiError.BadRequest('Phien dau thau van dang trong thoi gian nhan de xuat');
    }

    if (session.trangThai === TrangThaiPhien.MO) {
      await this.tenderSessionRepository.updateOne({ trangThai: TrangThaiPhien.DONG }, { where: { _id: sessionId } });
      session.trangThai = TrangThaiPhien.DONG;
    }

    const criteriaList = await this.tenderCriteriaRepository.getMany({ where: { phienId: sessionId } });
    const submissions = await this.tenderSubmissionRepository.getMany({ where: { phienId: sessionId } });

    if (submissions.length === 0) {
      return { message: 'Khong co de xuat nao de danh gia' };
    }

    const validSubmissions: any[] = [];
    for (const sub of submissions) {
      let isRejected = false;
      let rejectReason = '';

      const values = await this.tenderSubmissionValueRepository.getMany({ where: { deXuatId: sub._id } });
      const valuesMap = new Map(values.map((v) => [v.tieuChiId, v]));

      for (const cri of criteriaList) {
        const val = valuesMap.get(cri._id);
        if (cri.nhom === 'sang_loc') {
          if (cri.loai === LoaiTieuChi.DUNG_SAI) {
            const ok = val ? Boolean(val.giaTriDungSai) : false;
            if (!ok && (cri.batBuoc || cri.rangBuocCung)) {
              isRejected = true;
              rejectReason = `Khong dat tieu chi loc: ${cri.tenTieuChi}`;
              break;
            }
          }
        }
      }

      if (isRejected) {
        await this.tenderSubmissionRepository.updateOne(
          { trangThai: TrangThaiDeXuat.BI_TU_CHOI, lyDoTuChoi: rejectReason },
          { where: { _id: sub._id } },
        );
      } else {
        validSubmissions.push({ sub, values, valuesMap });
      }
    }

    if (validSubmissions.length === 0) {
      return { message: 'Tat ca de xuat deu khong vuot qua vong sang loc' };
    }

    const technicalCriteria = criteriaList.filter((c) => c.nhom !== 'sang_loc');
    const criteriaMinMax = new Map<string, { min: number; max: number }>();
    for (const cri of technicalCriteria) {
      if (cri.loai === LoaiTieuChi.SO || cri.loai === LoaiTieuChi.PHAN_TRAM) {
        let min = cri.giaTriToiThieu ?? Infinity;
        let max = cri.giaTriToiDa ?? -Infinity;
        for (const item of validSubmissions) {
          const valObj = item.valuesMap.get(cri._id);
          if (valObj && valObj.giaTriSo !== undefined) {
            if (valObj.giaTriSo < min) min = valObj.giaTriSo;
            if (valObj.giaTriSo > max) max = valObj.giaTriSo;
          }
        }
        if (min === Infinity) min = 0;
        if (max === -Infinity) max = 100;
        criteriaMinMax.set(cri._id, { min, max });
      }
    }

    const scoredSubmissions: any[] = [];
    for (const item of validSubmissions) {
      const technicalScores: Array<{ score: number; weight: number }> = [];
      for (const cri of technicalCriteria) {
        const valObj = item.valuesMap.get(cri._id);
        if (!valObj) continue;
        let score = 0;
        if (cri.loai === LoaiTieuChi.SO || cri.loai === LoaiTieuChi.PHAN_TRAM) {
          const { min, max } = criteriaMinMax.get(cri._id) || { min: 0, max: 100 };
          score = this.scoringService.normalizeNumber(valObj.giaTriSo ?? 0, min, max, cri.huongToiUu === HuongToiUu.THAP_HON);
        } else if (cri.loai === LoaiTieuChi.DUNG_SAI) {
          score = this.scoringService.normalizeBoolean(Boolean(valObj.giaTriDungSai));
        } else if (cri.loai === LoaiTieuChi.LUA_CHON) {
          score = this.scoringService.normalizeEnum(valObj.giaTriChuoi || '', cri.cacLuaChon || []);
        }
        await this.tenderSubmissionValueRepository.updateOne(
          { diemChuanHoa: score, diemCoTrongSo: score * cri.trongSo },
          { where: { _id: valObj._id } },
        );
        technicalScores.push({ score, weight: cri.trongSo });
      }
      const technicalScore = this.scoringService.calculateWeightedScore(technicalScores);
      if (technicalScore < session.diemKyThuatToiThieu) {
        await this.tenderSubmissionRepository.updateOne(
          { trangThai: TrangThaiDeXuat.BI_TU_CHOI, diemKyThuat: technicalScore, lyDoTuChoi: 'Khong dat diem toi thieu' },
          { where: { _id: item.sub._id } },
        );
      } else {
        scoredSubmissions.push({ ...item, technicalScore });
      }
    }

    if (scoredSubmissions.length === 0) return { message: 'Khong co de xuat nao dat muc diem ky thaut toi thieu' };

    const lowestPrice = Math.min(...scoredSubmissions.map((item) => Number(item.sub.giaDeXuat)));
    for (const item of scoredSubmissions) {
      const priceScore = this.scoringService.calculateTenderPriceScore(Number(item.sub.giaDeXuat), lowestPrice);
      const finalScore = this.scoringService.calculateTenderFinalScore(item.technicalScore, priceScore, {
        trongSoKyThuat: session.trongSoKyThuat,
        trongSoGia: session.trongSoGia,
      });
      item.priceScore = priceScore;
      item.finalScore = finalScore;
    }
    scoredSubmissions.sort((a, b) => b.finalScore - a.finalScore);

    let rank = 1;
    for (const item of scoredSubmissions) {
      const isWinner = rank === 1;
      await this.tenderSubmissionRepository.updateOne(
        { trangThai: isWinner ? TrangThaiDeXuat.THANG : TrangThaiDeXuat.HOP_LE, diemKyThuat: item.technicalScore, diemGia: item.priceScore, diemTongHop: item.finalScore, thuHang: rank },
        { where: { _id: item.sub._id } },
      );
      if (isWinner) await this.tenderSessionRepository.updateOne({ deXuatThangId: item.sub._id }, { where: { _id: sessionId } });
      rank++;
    }

    await this.auditLogService.logAction(userId, 'EVALUATE_TENDER_SESSION', 'TenderSession', sessionId, null, null);
    return this.getSessionDetails(sessionId);
  }

  async getSessionDetails(sessionId: string): Promise<TenderSessionDetails> {
    let session = await this.tenderSessionRepository.getOne({
      where: { _id: sessionId },
      include: [
        { model: UserModel, as: 'chuPhien', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
        { model: TenderCriteriaModel, as: 'tieuChi' },
        { model: TenderSubmissionModel, as: 'deXuatThang' },
      ],
    });
    if (!session) throw ApiError.NotFound('Phien dau thau khong ton tai');
    session = await this.checkAndTransitionStateInternal(session);
    return session as unknown as TenderSessionDetails;
  }

  async getSessionSubmissions(userId: string, sessionId: string, userRole?: string): Promise<TenderSubmissionDetails[]> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) throw ApiError.NotFound('Phien dau thau khong ton tai');
    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    let submissions = await this.tenderSubmissionRepository.getMany({
      where: { phienId: sessionId },
      order: [['diemTongHop', 'DESC']],
      include: [
        { model: UserModel, as: 'nguoiThamGia', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
        { model: TenderSubmissionValueModel, as: 'giaTriTieuChi' },
      ],
    });

    if (!isOwner && !isAdmin) {
      if (session.trangThai !== TrangThaiPhien.DONG) {
        submissions = submissions.filter((sub) => sub.nguoiThamGiaId === userId);
      }
    }

    const result: any[] = [];
    for (const sub of submissions) {
      const plainSub = { ...sub } as any;
      if (session.anDanh && !isOwner && !isAdmin && sub.nguoiThamGiaId !== userId) {
        plainSub.nguoiThamGiaId = 'ANONYMOUS';
        plainSub.nguoiThamGia = null;
      }
      result.push(plainSub);
    }
    return result;
  }

  async getRanking(userId: string, sessionId: string, userRole?: string): Promise<{ phienId: string; trangThai: string; danhSach: any[] }> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) throw ApiError.NotFound('Phien dau thau khong ton tai');
    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    const isClosed = session.trangThai === TrangThaiPhien.DONG;

    let submissions = await this.tenderSubmissionRepository.getMany({
      where: { phienId: sessionId },
      order: [['diemTongHop', 'DESC']],
      include: [
        { model: UserModel, as: 'nguoiThamGia', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
      ],
    });

    if (!isOwner && !isAdmin && !isClosed) {
      submissions = submissions.filter((sub) => sub.nguoiThamGiaId === userId);
    }

    const resultList = submissions.map((sub, index) => {
      let participantId = sub.nguoiThamGiaId;
      let participant = (sub as any).nguoiThamGia;
      if (session.anDanh && !isOwner && !isAdmin && sub.nguoiThamGiaId !== userId) {
        participantId = 'ANONYMOUS';
        participant = null;
      }
      return {
        thuHang: sub.thuHang || index + 1,
        deXuatId: sub._id,
        nguoiThamGiaId: participantId,
        nguoiThamGia: participant,
        diemKyThuat: sub.diemKyThuat,
        diemGia: sub.diemGia,
        diemTongHop: sub.diemTongHop,
        trangThai: sub.trangThai,
      };
    });

    return { phienId: session._id, trangThai: session.trangThai, danhSach: resultList };
  }

  async closeSession(userId: string, sessionId: string, isSystem = false, userRole?: string): Promise<TenderSessionDetails> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }
    const isOwner = session.chuPhienId === userId;
    const isAdmin = userRole === UserRoles.ADMIN;
    if (!isSystem && !isOwner && !isAdmin) {
      throw ApiError.Forbidden('Ban khong co quyen dong phien nay');
    }
    if (session.trangThai === TrangThaiPhien.DONG) {
      throw ApiError.BadRequest('Phien da dong truoc do');
    }

    await this.tenderSessionRepository.updateOne(
      { trangThai: TrangThaiPhien.DONG, thoiDiemDong: new Date() },
      { where: { _id: sessionId } },
    );

    await this.evaluateSession(userId, sessionId, true, isSystem, userRole);

    const submissions = await this.tenderSubmissionRepository.getMany({
      where: { phienId: sessionId },
    });
    for (const sub of submissions) {
      if (sub.trangThai === TrangThaiDeXuat.HOP_LE) {
        await this.tenderSubmissionRepository.updateOne(
          { trangThai: TrangThaiDeXuat.THUA },
          { where: { _id: sub._id } },
        );
      }
    }

    await this.auditLogService.logAction(
      userId,
      'CLOSE_TENDER_SESSION',
      'TenderSession',
      sessionId,
      { trangThai: session.trangThai },
      { trangThai: TrangThaiPhien.DONG },
    );

    return this.getSessionDetails(sessionId);
  }
}
