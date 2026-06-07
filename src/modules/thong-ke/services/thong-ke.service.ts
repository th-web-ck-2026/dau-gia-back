import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ThongKe } from '../entities/thong-ke.entity';
import { ThongKeRepository } from '../repositories/thong-ke.repository';
import { Op } from 'sequelize';

// Models
import { UserModel } from '@/modules/user/models/user.model';
import { AuctionSessionModel } from '@/modules/auction/models/auction-session.model';
import { TenderSessionModel } from '@/modules/tender/models/tender-session.model';
import { XacMinhUserModel } from '@/modules/xac-minh-user/models/xac-minh-user.model';
import { AuctionBidModel } from '@/modules/auction/models/auction-bid.model';
import { TenderSubmissionModel } from '@/modules/tender/models/tender-submission.model';

// Constants
import { UserRoles, UserStatus, UserRoleType } from '@/modules/user/common/constant';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiXacMinhUser } from '@/modules/xac-minh-user/common/constant';

@Injectable()
export class ThongKeService extends BaseService<ThongKe> {
  constructor(private readonly thongKeRepository: ThongKeRepository) {
    super(thongKeRepository);
  }

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      normalUsers,
      toChucUsers,
      caNhanUsers,

      totalAuctions,
      draftAuctions,
      publishedAuctions,
      openAuctions,
      closedAuctions,
      cancelledAuctions,
      successfulAuctions,
      totalWinningValue,
      totalBids,

      totalTenders,
      draftTenders,
      publishedTenders,
      openTenders,
      closedTenders,
      cancelledTenders,
      successfulTenders,
      totalSubmissions,

      totalVerifications,
      pendingVerifications,
      approvedVerifications,
      rejectedVerifications,
    ] = await Promise.all([
      UserModel.count(),
      UserModel.count({ where: { userStatus: UserStatus.ACTIVE } }),
      UserModel.count({ where: { userStatus: UserStatus.BLOCKED } }),
      UserModel.count({ where: { isVerified: true } }),
      UserModel.count({ where: { isVerified: { [Op.ne]: true } } }),
      UserModel.count({ where: { role: UserRoles.ADMIN } }),
      UserModel.count({ where: { role: UserRoles.USER } }),
      UserModel.count({ where: { userRoles: UserRoleType.TO_CHUC } }),
      UserModel.count({ where: { userRoles: UserRoleType.CA_NHAN } }),

      AuctionSessionModel.count(),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.NHAP } }),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.CONG_BO } }),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.MO } }),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.DONG } }),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.HUY } }),
      AuctionSessionModel.count({ where: { trangThai: TrangThaiPhien.DONG, deXuatThangId: { [Op.ne]: null } } }),
      AuctionSessionModel.sum('giaCaoNhat', { where: { trangThai: TrangThaiPhien.DONG, deXuatThangId: { [Op.ne]: null } } }),
      AuctionBidModel.count(),

      TenderSessionModel.count(),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.NHAP } }),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.CONG_BO } }),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.MO } }),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.DONG } }),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.HUY } }),
      TenderSessionModel.count({ where: { trangThai: TrangThaiPhien.DONG, deXuatThangId: { [Op.ne]: null } } }),
      TenderSubmissionModel.count(),

      XacMinhUserModel.count(),
      XacMinhUserModel.count({ where: { trangThai: TrangThaiXacMinhUser.CHO_DUYET } }),
      XacMinhUserModel.count({ where: { trangThai: TrangThaiXacMinhUser.DUYET } }),
      XacMinhUserModel.count({ where: { trangThai: TrangThaiXacMinhUser.TU_CHOI } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        byRole: {
          ADMIN: adminUsers,
          USER: normalUsers,
        },
        byType: {
          TO_CHUC: toChucUsers,
          CA_NHAN: caNhanUsers,
        },
      },
      auctions: {
        total: totalAuctions,
        draft: draftAuctions,
        published: publishedAuctions,
        open: openAuctions,
        closed: closedAuctions,
        cancelled: cancelledAuctions,
        successful: successfulAuctions,
        totalWinningValue: Number(totalWinningValue || 0),
        totalBids,
      },
      tenders: {
        total: totalTenders,
        draft: draftTenders,
        published: publishedTenders,
        open: openTenders,
        closed: closedTenders,
        cancelled: cancelledTenders,
        successful: successfulTenders,
        totalSubmissions,
      },
      verifications: {
        total: totalVerifications,
        pending: pendingVerifications,
        approved: approvedVerifications,
        rejected: rejectedVerifications,
      },
    };
  }
}
