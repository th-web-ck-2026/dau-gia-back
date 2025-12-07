import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { UnitService } from '@/modules/unit/services/unit.service';
import { PropertieService } from '@/modules/propertie/services/propertie.service';
import { HopDongThueService } from '@/modules/hop-dong-thue/services/hop-dong-thue.service';
import { HoaDonChoThueService } from '@/modules/hoa-don/services/hoa-don.cho-thue.service';
import { Op } from 'sequelize';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { HopDongTrangThai } from '@/modules/hop-dong-thue/common/constant';

@Injectable()
export class ThongKeService {
  constructor(
    private readonly hoaDonChoThueService: HoaDonChoThueService,
    private readonly hopDongThueService: HopDongThueService,
    private readonly propertieService: PropertieService,
    private readonly unitService: UnitService,
  ) {}
  // Thống kê tỷ lệ lấp đầy theo ngày từ ngày đến ngày
  async thongKeTapDongTheoNgay(
    user: AuthUser,
    ngayBatDau: Date,
    ngayKetThuc: Date,
  ) {
    const ngayBatDauStart = new Date(ngayBatDau);
    ngayBatDauStart.setHours(0, 0, 0, 0);
    const ngayKetThucEnd = new Date(ngayKetThuc);
    ngayKetThucEnd.setHours(23, 59, 59, 999);

    // Lấy các đơn vị đã tồn tại trong khoảng thời gian thống kê (createdAt <= ngayKetThuc)
    const units = await this.unitService.getMany({
      where: {
        userId: user.id,
        createdAt: {
          [Op.lte]: ngayKetThucEnd,
        },
      },
      attributes: ['_id', 'ten', 'code', 'createdAt'],
    });

    const hopDongThues = await this.hopDongThueService.getMany({
      where: {
        userId: user.id,
        ngayBatDauThue: {
          [Op.lte]: ngayKetThucEnd,
        },
        ngayKetThucThue: {
          [Op.gte]: ngayBatDauStart,
        },
        trangThai: {
          [Op.in]: [
            HopDongTrangThai.DANG_THUE,
            HopDongTrangThai.CHO_HOAN_THANH,
          ],
        },
      },
      attributes: [
        '_id',
        'unitId',
        'ngayBatDauThue',
        'ngayKetThucThue',
        'trangThai',
      ],
    });

    // Hàm format ngày thành yyyy/mm/dd
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}/${month}/${day}`;
    };

    // Hàm tạo danh sách các ngày từ ngayBatDau đến ngayKetThuc
    const getDatesInRange = (start: Date, end: Date): Date[] => {
      const dates: Date[] = [];
      const currentDate = new Date(start);
      currentDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    };

    const result: Record<
      string,
      {
        tongSoDonViThue: number;
        soDonViDangChoThue: number;
      }
    > = {};

    const dates = getDatesInRange(ngayBatDau, ngayKetThuc);

    for (const date of dates) {
      const dateStr = formatDate(date);
      const dateStartOfDay = new Date(date);
      dateStartOfDay.setHours(0, 0, 0, 0);
      const dateEndOfDay = new Date(date);
      dateEndOfDay.setHours(23, 59, 59, 999);

      // Tính tongSoDonViThue (units có createdAt <= ngày đó)
      const tongSoDonViChoThue = units.filter((unit) => {
        const unitWithCreatedAt = unit as BaseEntity;
        if (!unitWithCreatedAt.createdAt) return false;
        const unitCreatedAt = new Date(unitWithCreatedAt.createdAt);
        unitCreatedAt.setHours(0, 0, 0, 0);
        return unitCreatedAt <= dateStartOfDay;
      }).length;

      const unitIdsDangChoThue = new Set<string>();
      hopDongThues.forEach((hopDong) => {
        if (
          hopDong.trangThai !== HopDongTrangThai.DANG_THUE &&
          hopDong.trangThai !== HopDongTrangThai.CHO_HOAN_THANH
        ) {
          return;
        }
        const ngayBatDauThue = new Date(hopDong.ngayBatDauThue);
        ngayBatDauThue.setHours(0, 0, 0, 0);
        const ngayKetThucThue = new Date(hopDong.ngayKetThucThue);
        ngayKetThucThue.setHours(0, 0, 0, 0);

        if (
          dateStartOfDay.getTime() >= ngayBatDauThue.getTime() &&
          dateStartOfDay.getTime() <= ngayKetThucThue.getTime()
        ) {
          unitIdsDangChoThue.add(hopDong.unitId);
        }
      });

      const soDonViDangChoThue = unitIdsDangChoThue.size;

      result[dateStr] = {
        tongSoDonViThue: tongSoDonViChoThue,
        soDonViDangChoThue: soDonViDangChoThue,
      };
    }

    return result;
  }
}
