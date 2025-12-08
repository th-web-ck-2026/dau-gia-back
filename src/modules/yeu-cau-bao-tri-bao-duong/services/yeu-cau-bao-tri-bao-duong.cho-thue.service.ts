import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';
import { YeuCauBaoTriBaoDuongRepository } from '../repositories/yeu-cau-bao-tri-bao-duong.repository';
import { CreateYeuCauBaoTriBaoDuongDto } from '../dto/create-yeu-cau-bao-tri-bao-duong.dto';
import { UpdateYeuCauBaoTriBaoDuongDto } from '../dto/update-yeu-cau-bao-tri-bao-duong.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ConditionYeuCauBaoTriBaoDuongDto } from '../dto/condition-yeu-cau-bao-tri-bao-duong.dto';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { UserModel } from '@/modules/user/models/user.model';
import { YeuCauBaoTriBaoDuongTrangThai } from '../common/constant';
import { ApiError } from '@/common/exceptions/api-error';
import { Sequelize } from 'sequelize-typescript';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';

@Injectable()
export class YeuCauBaoTriBaoDuongChoThueService extends BaseService<YeuCauBaoTriBaoDuong> {
  constructor(
    private readonly yeuCauBaoTriBaoDuongRepository: YeuCauBaoTriBaoDuongRepository,
    private readonly sequelize: Sequelize,
  ) {
    super(yeuCauBaoTriBaoDuongRepository);
  }
  async getMePage(
    user: AuthUser,
    condition: ConditionYeuCauBaoTriBaoDuongDto,
    query: QueryOption,
  ) {
    return this.getPage(
      {
        where: { ...condition, userId: user.id },
        include: [
          {
            model: UnitModel,
            include: [
              {
                model: PropertieModel,
              },
            ],
          },
          {
            model: UserModel,
            as: 'khachHangUser',
            attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
          },
        ],
      },
      query,
    );
  }
  async getMeById(user: AuthUser, id: string) {
    return this.getOne({
      where: { _id: id, userId: user.id },
      include: [
        {
          model: UnitModel,
          include: [
            {
              model: PropertieModel,
            },
          ],
        },
        {
          model: UserModel,
          as: 'khachHangUser',
          attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'],
        },
      ],
    });
  }
  async tiepNhanYeuCauBaoTriBaoDuong(
    user: AuthUser,
    id: string,
    ngayDuKienHoanThanh: Date,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const yeuCauBaoTriBaoDuong = await this.getOne({
        where: { _id: id, userId: user.id },
        transaction,
      });
      if (!yeuCauBaoTriBaoDuong) {
        throw ApiError.NotFound('Yêu cầu bảo trì bảo dưỡng không tồn tại');
      }

      yeuCauBaoTriBaoDuong.trangThai =
        YeuCauBaoTriBaoDuongTrangThai.DA_TIEN_NHAN;
      yeuCauBaoTriBaoDuong.ngayTiepNhan = new Date();
      yeuCauBaoTriBaoDuong.ngayDuKienHoanThanh = ngayDuKienHoanThanh;
      const res = await this.yeuCauBaoTriBaoDuongRepository.updateOne(
        yeuCauBaoTriBaoDuong,
        {
          where: { _id: id },
          transaction,
        },
      );
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async hoanThanhYeuCauBaoTriBaoDuong(user: AuthUser, id: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const yeuCauBaoTriBaoDuong = await this.getOne({
        where: { _id: id, userId: user.id },
        transaction,
      });
      if (!yeuCauBaoTriBaoDuong) {
        throw ApiError.NotFound('Yêu cầu bảo trì bảo dưỡng không tồn tại');
      }
      if (
        yeuCauBaoTriBaoDuong.trangThai !==
        YeuCauBaoTriBaoDuongTrangThai.DA_TIEN_NHAN
      ) {
        throw ApiError.BadRequest(
          'Yêu cầu bảo trì bảo dưỡng chưa được tiếp nhận',
        );
      }

      yeuCauBaoTriBaoDuong.trangThai =
        YeuCauBaoTriBaoDuongTrangThai.DA_HOAN_THANH;
      yeuCauBaoTriBaoDuong.ngayHoanThanh = new Date();
      const res = await this.yeuCauBaoTriBaoDuongRepository.updateOne(
        yeuCauBaoTriBaoDuong,
        {
          where: { _id: id },
          transaction,
        },
      );
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async huyYeuCauBaoTriBaoDuong(user: AuthUser, id: string, lyDo: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const yeuCauBaoTriBaoDuong = await this.getOne({
        where: { _id: id, userId: user.id },
        transaction,
      });
      if (!yeuCauBaoTriBaoDuong) {
        throw ApiError.NotFound('Yêu cầu bảo trì bảo dưỡng không tồn tại');
      }
      if (
        yeuCauBaoTriBaoDuong.trangThai ===
        YeuCauBaoTriBaoDuongTrangThai.DA_HOAN_THANH
      ) {
        throw ApiError.BadRequest(
          'Yêu cầu bảo trì bảo dưỡng đã được hoàn thành',
        );
      }
      if (
        yeuCauBaoTriBaoDuong.trangThai === YeuCauBaoTriBaoDuongTrangThai.DA_HUY
      ) {
        throw ApiError.BadRequest('Yêu cầu bảo trì bảo dưỡng đã được hủy');
      }
      yeuCauBaoTriBaoDuong.trangThai = YeuCauBaoTriBaoDuongTrangThai.DA_HUY;
      yeuCauBaoTriBaoDuong.ngayHuy = new Date();
      yeuCauBaoTriBaoDuong.lyDoHuy = lyDo;
      const res = await this.yeuCauBaoTriBaoDuongRepository.updateOne(
        yeuCauBaoTriBaoDuong,
        {
          where: { _id: id },
          transaction,
        },
      );
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
