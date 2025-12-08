import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';
import { YeuCauBaoTriBaoDuongRepository } from '../repositories/yeu-cau-bao-tri-bao-duong.repository';
import { CreateYeuCauBaoTriBaoDuongDto } from '../dto/create-yeu-cau-bao-tri-bao-duong.dto';
import { UpdateYeuCauBaoTriBaoDuongDto } from '../dto/update-yeu-cau-bao-tri-bao-duong.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { UnitService } from '@/modules/unit/services/unit.service';
import { Sequelize } from 'sequelize-typescript';
import { ApiError } from '@/common/exceptions/api-error';
import { HopDongThueService } from '@/modules/hop-dong-thue/services/hop-dong-thue.service';
import { HopDongTrangThai } from '@/modules/hop-dong-thue/common/constant';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UserModel } from '@/modules/user/models/user.model';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';

@Injectable()
export class YeuCauBaoTriBaoDuongThueService extends BaseService<YeuCauBaoTriBaoDuong> {
  constructor(
    private readonly yeuCauBaoTriBaoDuongRepository: YeuCauBaoTriBaoDuongRepository,
    private readonly unitService: UnitService,
    private readonly hopDongThueService: HopDongThueService,
    private readonly sequelize: Sequelize,
  ) {
    super(yeuCauBaoTriBaoDuongRepository);
  }
  async createYeuCauBaoTriBaoDuongThue(
    user: AuthUser,
    createYeuCauBaoTriBaoDuongDto: CreateYeuCauBaoTriBaoDuongDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const hopDongThue = await this.hopDongThueService.getOne({
        where: {
          unitId: createYeuCauBaoTriBaoDuongDto.unitId,
          khachHangUserId: user.id,
          trangThai: HopDongTrangThai.DANG_THUE,
        },
        transaction,
      });
      if (!hopDongThue) {
        throw ApiError.NotFound(
          'Bạn không có quyền tạo yêu cầu bảo trì bảo dưỡng cho đơn vị này',
        );
      }

      const yeuCauBaoTriBaoDuong =
        await this.yeuCauBaoTriBaoDuongRepository.create(
          {
            ...createYeuCauBaoTriBaoDuongDto,
            userId: hopDongThue.userId,
            khachHangUserId: user.id,
          },
          { transaction },
        );
      if (!yeuCauBaoTriBaoDuong) {
        throw ApiError.BadRequest('Lỗi khi tạo yêu cầu bảo trì bảo dưỡng');
      }
      await transaction.commit();
      return yeuCauBaoTriBaoDuong;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async getMePage(user: AuthUser, query: QueryOption) {
    return this.getPage(
      {
        where: { khachHangUserId: user.id },
        include: [
          {
            model: UnitModel,
            include: [
              {
                model: PropertieModel,
              },
            ],
          },
        ],
      },
      query,
    );
  }
  async getMeById(user: AuthUser, id: string) {
    return this.getOne({
      where: { _id: id, khachHangUserId: user.id },
      include: [
        {
          model: UnitModel,
          include: [
            {
              model: PropertieModel,
            },
          ],
        },
      ],
    });
  }
}
