import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { HoaDon } from '../entities/hoa-don.entity';
import { HoaDonRepository } from '../repositories/hoa-don.repository';
import { CreateHoaDonDto } from '../dto/create-hoa-don.dto';
import { UpdateHoaDonDto } from '../dto/update-hoa-don.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { HopDongThueService } from '@/modules/hop-dong-thue/services/hop-dong-thue.service';
import { ApiError } from '@/common/exceptions/api-error';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionHoaDonDto } from '../dto/condition-hoa-don.dto';
import {
  HoaDonTrangThai,
  HoaDonTrangThaiKhachHangThanhToan,
  TrangThaiXacNhanNoiDungHoaDon,
} from '../common/constant';
import { XacNhanNoiDungHoaDonDto } from '../dto/xac-nhan-noi-dung-hoa-don.dto';

@Injectable()
export class HoaDonNguoiThueService extends BaseService<HoaDon> {
  constructor(
    private readonly hoaDonRepository: HoaDonRepository,
    private readonly hopDongThueService: HopDongThueService,
  ) {
    super(hoaDonRepository);
  }

  async getHoaDonNguoiThuePageMe(
    user: AuthUser,
    condition: ConditionHoaDonDto,
    query: QueryOption,
  ) {
    return this.hoaDonRepository.getPage(
      {
        where: { ...condition, khachHangUserId: user.id },
        include: [
          {
            model: HopDongThueModel,
          },
        ],
      },
      query,
    );
  }
  async xacNhanThanhToanHoaDonNguoiThue(user: AuthUser, hoaDonId: string) {
    const hoaDon = await this.hoaDonRepository.getOne({
      where: { _id: hoaDonId, khachHangUserId: user.id },
    });
    if (!hoaDon) {
      throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
    }
    if (hoaDon.trangThai !== HoaDonTrangThai.CHO_THANH_TOAN) {
      throw ApiError.BadRequest('Hợp đồng thuê không thể thanh toán');
    }
    hoaDon.trangThaiKhachHangThanhToan =
      HoaDonTrangThaiKhachHangThanhToan.DA_THANH_TOAN;
    hoaDon.ngayXacNhanThanhToan = new Date();
    return this.hoaDonRepository.updateOne(hoaDon, {
      where: { _id: hoaDonId },
    });
  }
  async nguoiThueXacNhanNoiDungHoaDon(
    user: AuthUser,
    hoaDonId: string,
    xacNhanNoiDungHoaDonDto: XacNhanNoiDungHoaDonDto,
  ) {
    const hoaDon = await this.hoaDonRepository.getOne({
      where: { _id: hoaDonId, khachHangUserId: user.id },
    });
    if (!hoaDon) {
      throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
    }
    if (hoaDon.trangThai !== HoaDonTrangThai.CHO_XAC_NHAN) {
      throw ApiError.BadRequest('Hợp đồng thuê không thể xác nhận nội dung');
    }
    hoaDon.trangThai =
      xacNhanNoiDungHoaDonDto.trangThaiXacNhan ===
      TrangThaiXacNhanNoiDungHoaDon.XAC_NHAN
        ? HoaDonTrangThai.CHO_THANH_TOAN
        : HoaDonTrangThai.DA_HUY;
    hoaDon.khachHangGhiChu = xacNhanNoiDungHoaDonDto.ghiChu;
    return this.hoaDonRepository.updateOne(hoaDon, {
      where: { _id: hoaDonId },
    });
  }
}
