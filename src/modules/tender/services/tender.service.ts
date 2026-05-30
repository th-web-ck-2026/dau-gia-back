import { Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { TenderSession } from '../entities/tender-session.entity';
import { TenderSessionRepository } from '../repositories/tender-session.repository';
import { TenderCriteriaRepository } from '../repositories/tender-criteria.repository';
import { TenderSubmissionRepository } from '../repositories/tender-submission.repository';
import { TenderSubmissionValueRepository } from '../repositories/tender-submission-value.repository';
import { ScoringService } from '@/modules/scoring/services/scoring.service';
import { CreateTenderSessionDto } from '../dto/create-tender-session.dto';
import { SubmitTenderProposalDto } from '../dto/submit-tender-proposal.dto';
import { ApiError } from '@/common/exceptions/api-error';
import { TrangThaiPhien, TrangThaiDeXuat, LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';
import { Op } from 'sequelize';

@Injectable()
export class TenderService extends BaseService<TenderSession> {
  constructor(
    private readonly tenderSessionRepository: TenderSessionRepository,
    private readonly tenderCriteriaRepository: TenderCriteriaRepository,
    private readonly tenderSubmissionRepository: TenderSubmissionRepository,
    private readonly tenderSubmissionValueRepository: TenderSubmissionValueRepository,
    private readonly scoringService: ScoringService,
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

        // Update non-winning valid submissions to THUA instead of HOP_LE
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

  async createSession(userId: string, dto: CreateTenderSessionDto): Promise<TenderSession> {
    const start = new Date(dto.thoiGianBatDau);
    const end = new Date(dto.thoiGianKetThuc);
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

    return this.getSessionDetails(session._id);
  }

  async publishSession(userId: string, sessionId: string): Promise<TenderSession> {
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

    return this.getSessionDetails(sessionId);
  }

  async submitProposal(userId: string, dto: SubmitTenderProposalDto): Promise<any> {
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

    // Validate inputs
    for (const valDto of dto.giaTriTieuChi) {
      const criteria = criteriaMap.get(valDto.tieuChiId);
      if (!criteria) {
        throw ApiError.BadRequest(`Tieu chi ID "${valDto.tieuChiId}" khong thuoc phien nay`);
      }

      if (criteria.batBuoc && (valDto.giaTriGoc === undefined || valDto.giaTriGoc === null || valDto.giaTriGoc === '')) {
        throw ApiError.BadRequest(`Tieu chi "${criteria.tenTieuChi}" la bat buoc`);
      }

      if (criteria.rangBuocCung) {
        if (criteria.loai === LoaiTieuChi.SO || criteria.loai === LoaiTieuChi.PHAN_TRAM) {
          const numVal = Number(valDto.giaTriGoc);
          if (criteria.giaTriToiThieu !== undefined && numVal < criteria.giaTriToiThieu) {
            throw ApiError.BadRequest(`Gia tri tieu chi "${criteria.tenTieuChi}" phai lon hon hoac bang ${criteria.giaTriToiThieu}`);
          }
          if (criteria.giaTriToiDa !== undefined && numVal > criteria.giaTriToiDa) {
            throw ApiError.BadRequest(`Gia tri tieu chi "${criteria.tenTieuChi}" phai nho hon hoac bang ${criteria.giaTriToiDa}`);
          }
        }
      }
    }

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

    return submission;
  }

  async evaluateSession(userId: string, sessionId: string, force = false, isSystem = false): Promise<any> {
    const session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }
    if (!isSystem && session.chuPhienId !== userId) {
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

    // Step 1: Pre-screening on pass/fail (sang_loc) and hard constraints
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

    // Step 2: Calculate technical score (chuan hoa tung tieu chi va nhan trong so)
    // Gather all numeric criteria bounds from valid submissions
    const technicalCriteria = criteriaList.filter((c) => c.nhom !== 'sang_loc');

    const criteriaMinMax = new Map<string, { min: number; max: number }>();
    for (const cri of technicalCriteria) {
      if (cri.loai === LoaiTieuChi.SO || cri.loai === LoaiTieuChi.PHAN_TRAM) {
        let min = cri.giaTriToiThieu ?? Infinity;
        let max = cri.giaTriToiDa ?? -Infinity;

        // If min/max are not defined in criteria, calculate from actual submissions
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
          const value = valObj.giaTriSo ?? 0;
          score = this.scoringService.normalizeNumber(value, min, max, cri.huongToiUu === HuongToiUu.THAP_HON);
        } else if (cri.loai === LoaiTieuChi.DUNG_SAI) {
          score = this.scoringService.normalizeBoolean(Boolean(valObj.giaTriDungSai));
        } else if (cri.loai === LoaiTieuChi.LUA_CHON) {
          score = this.scoringService.normalizeEnum(valObj.giaTriChuoi || '', cri.cacLuaChon || []);
        }

        // Save normalized scores
        await this.tenderSubmissionValueRepository.updateOne(
          { diemChuanHoa: score, diemCoTrongSo: score * cri.trongSo },
          { where: { _id: valObj._id } },
        );

        technicalScores.push({ score, weight: cri.trongSo });
      }

      // Sum tech weights using weighted average
      const technicalScore = this.scoringService.calculateWeightedScore(technicalScores);

      if (technicalScore < session.diemKyThuatToiThieu) {
        await this.tenderSubmissionRepository.updateOne(
          {
            trangThai: TrangThaiDeXuat.BI_TU_CHOI,
            diemKyThuat: technicalScore,
            lyDoTuChoi: `Diem ky thuat (${technicalScore.toFixed(2)}) thap hon muc toi thieu (${session.diemKyThuatToiThieu})`,
          },
          { where: { _id: item.sub._id } },
        );
      } else {
        scoredSubmissions.push({ ...item, technicalScore });
      }
    }

    if (scoredSubmissions.length === 0) {
      return { message: 'Khong co de xuat nao dat muc diem ky thuat toi thieu' };
    }

    // Step 3: Calculate price score & final composite score
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

    // Step 4: Sort and rank
    scoredSubmissions.sort((a, b) => b.finalScore - a.finalScore);

    let rank = 1;
    for (const item of scoredSubmissions) {
      const isWinner = rank === 1;
      await this.tenderSubmissionRepository.updateOne(
        {
          trangThai: isWinner ? TrangThaiDeXuat.THANG : TrangThaiDeXuat.HOP_LE,
          diemKyThuat: item.technicalScore,
          diemGia: item.priceScore,
          diemTongHop: item.finalScore,
          thuHang: rank,
        },
        { where: { _id: item.sub._id } },
      );

      if (isWinner) {
        await this.tenderSessionRepository.updateOne(
          { deXuatThangId: item.sub._id },
          { where: { _id: sessionId } },
        );
      }
      rank++;
    }

    return this.getSessionDetails(sessionId);
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }
    session = await this.checkAndTransitionStateInternal(session);
    const criteria = await this.tenderCriteriaRepository.getMany({ where: { phienId: sessionId } });
    return {
      ...session,
      tieuChi: criteria,
    };
  }

  async getSessionSubmissions(userId: string, sessionId: string): Promise<any[]> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const submissions = await this.tenderSubmissionRepository.getMany({
      where: { phienId: sessionId },
      order: [['diemTongHop', 'DESC']],
    });

    const result: any[] = [];
    for (const sub of submissions) {
      const values = await this.tenderSubmissionValueRepository.getMany({ where: { deXuatId: sub._id } });
      const plainSub = { ...sub } as any;

      if (session.anDanh && !isOwner && sub.nguoiThamGiaId !== userId) {
        plainSub.nguoiThamGiaId = 'ANONYMOUS';
      }

      result.push({
        ...plainSub,
        giaTriTieuChi: values,
      });
    }

    return result;
  }

  async getRanking(userId: string, sessionId: string): Promise<any> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }

    session = await this.checkAndTransitionStateInternal(session);

    const isOwner = session.chuPhienId === userId;
    const submissions = await this.tenderSubmissionRepository.getMany({
      where: { phienId: sessionId },
      order: [['diemTongHop', 'DESC']],
    });

    const resultList = submissions.map((sub, index) => {
      const isSelf = sub.nguoiThamGiaId === userId;
      let bietDanh = `Bidder ${String.fromCharCode(65 + index)}`; // e.g. Bidder A, Bidder B
      let participantId = sub.nguoiThamGiaId;
      if (session.anDanh && !isOwner && !isSelf) {
        participantId = 'ANONYMOUS';
      } else {
        bietDanh = sub.nguoiThamGiaId;
      }
      return {
        thuHang: sub.thuHang || index + 1,
        deXuatId: sub._id,
        nguoiThamGiaId: participantId,
        bietDanh,
        diemKyThuat: sub.diemKyThuat,
        diemGia: sub.diemGia,
        diemTongHop: sub.diemTongHop,
        trangThai: sub.trangThai,
      };
    });

    return {
      phienId: session._id,
      trangThai: session.trangThai,
      danhSach: resultList,
    };
  }

  async closeSession(userId: string, sessionId: string, isSystem = false): Promise<any> {
    let session = await this.tenderSessionRepository.getOne({ where: { _id: sessionId } });
    if (!session) {
      throw ApiError.NotFound('Phien dau thau khong ton tai');
    }
    if (!isSystem && session.chuPhienId !== userId) {
      throw ApiError.Forbidden('Ban khong co quyen dong phien nay');
    }
    if (session.trangThai === TrangThaiPhien.DONG) {
      throw ApiError.BadRequest('Phien da dong truoc do');
    }

    await this.tenderSessionRepository.updateOne(
      { trangThai: TrangThaiPhien.DONG, thoiDiemDong: new Date() },
      { where: { _id: sessionId } },
    );

    await this.evaluateSession(userId, sessionId, true, isSystem);

    // Update non-winning valid submissions to THUA instead of HOP_LE
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

    return this.getSessionDetails(sessionId);
  }
}
