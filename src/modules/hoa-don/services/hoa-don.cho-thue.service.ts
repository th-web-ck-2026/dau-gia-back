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
} from '../common/constant';

@Injectable()
export class HoaDonChoThueService extends BaseService<HoaDon> {
  constructor(
    private readonly hoaDonRepository: HoaDonRepository,
    private readonly hopDongThueService: HopDongThueService,
  ) {
    super(hoaDonRepository);
  }
  async createHoaDonChoThue(
    user: AuthUser,
    createHoaDonChoThueDto: CreateHoaDonDto,
  ) {
    const hopDongThue = await this.hopDongThueService.getOne({
      where: { _id: createHoaDonChoThueDto.hopDongThueId, userId: user.id },
    });
    if (!hopDongThue) {
      throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
    }

    let trangThai: HoaDonTrangThai;
    if (
      createHoaDonChoThueDto.dichVus.some(
        (dichVu) =>
          !hopDongThue.dichVuThues.some(
            (dichVuHopDong) => dichVuHopDong.tenDichVu === dichVu.tenDichVu,
          ),
      )
    ) {
      trangThai = HoaDonTrangThai.CHO_XAC_NHAN;
    } else {
      trangThai = HoaDonTrangThai.CHO_THANH_TOAN;
    }
    return this.hoaDonRepository.create({
      ...createHoaDonChoThueDto,
      trangThai,
      userId: user.id,
      hopDongThueId: hopDongThue._id,
      khachHangUserId: hopDongThue.khachHangUserId,
    });
  }

  async getHoaDonChoThuePageMe(
    user: AuthUser,
    condition: ConditionHoaDonDto,
    query: QueryOption,
  ) {
    return this.hoaDonRepository.getPage(
      {
        where: { ...condition, userId: user.id },
        include: [
          {
            model: HopDongThueModel,
          },
        ],
      },
      query,
    );
  }
  async updateTrangThaiThanhToanHoaDonChoThue(
    user: AuthUser,
    hoaDonId: string,
    trangThai: HoaDonTrangThai,
  ) {
    const hoaDon = await this.hoaDonRepository.getOne({
      where: { _id: hoaDonId, userId: user.id },
    });
    if (!hoaDon) {
      throw ApiError.NotFound('Hợp đồng thuê không tồn tại');
    }
    hoaDon.trangThai = trangThai;
    if (trangThai === HoaDonTrangThai.DA_THANH_TOAN) {
      hoaDon.trangThaiKhachHangThanhToan =
        HoaDonTrangThaiKhachHangThanhToan.DA_THANH_TOAN;
      hoaDon.ngayXacNhanThanhToan = new Date();
    } else {
      hoaDon.trangThaiKhachHangThanhToan =
        HoaDonTrangThaiKhachHangThanhToan.CHO_THANH_TOAN;
    }

    return this.hoaDonRepository.updateOne(hoaDon, {
      where: { _id: hoaDonId },
    });
  }
}
