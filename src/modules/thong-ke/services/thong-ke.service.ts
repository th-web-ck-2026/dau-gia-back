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
import { HoaDonTrangThai } from '@/modules/hoa-don/common/constant';
import { HoaDonModel } from '@/modules/hoa-don/models/hoa-don.model';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';
import { HoaDon } from '@/modules/hoa-don/entities/hoa-don.entity';
import { Propertie } from '@/modules/propertie/entities/propertie.entity';
import { formatMonth } from '@/common/utils/string.utils';

@Injectable()
export class ThongKeService {
  constructor(
    private readonly hoaDonChoThueService: HoaDonChoThueService,
    private readonly hopDongThueService: HopDongThueService,
    private readonly propertieService: PropertieService,
    private readonly unitService: UnitService,
  ) {}
  async thongKeTapDongTheoNgay(
    user: AuthUser,
    thangBatDau: Date,
    thangKetThuc: Date,
  ) {
    const thangBatDauDate = new Date(thangBatDau);
    const ngayBatDauStart = new Date(
      thangBatDauDate.getFullYear(),
      thangBatDauDate.getMonth(),
      1,
    );
    ngayBatDauStart.setHours(0, 0, 0, 0);

    const thangKetThucDate = new Date(thangKetThuc);
    const ngayKetThucEnd = new Date(
      thangKetThucDate.getFullYear(),
      thangKetThucDate.getMonth() + 1,
      0, // Ngày 0 = ngày cuối cùng của tháng trước
    );
    ngayKetThucEnd.setHours(23, 59, 59, 999);

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

    const getMonthsInRange = (start: Date, end: Date): string[] => {
      const months: string[] = [];
      const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(end.getFullYear(), end.getMonth(), 1);

      while (currentDate <= endDate) {
        months.push(formatMonth(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return months;
    };

    const result: Record<
      string,
      {
        tongSoDonViThue: number;
        soDonViDangChoThue: number;
      }
    > = {};

    const months = getMonthsInRange(ngayBatDauStart, ngayKetThucEnd);

    for (const monthKey of months) {
      const [year, month] = monthKey.split('/').map(Number);
      // Ngày đầu tháng
      const ngayDauThang = new Date(year, month - 1, 1);
      ngayDauThang.setHours(0, 0, 0, 0);
      // Ngày cuối tháng
      const ngayCuoiThang = new Date(year, month, 0);
      ngayCuoiThang.setHours(23, 59, 59, 999);

      // Tính tongSoDonViThue (units có createdAt <= ngày cuối tháng)
      const tongSoDonViChoThue = units.filter((unit) => {
        const unitWithCreatedAt = unit as BaseEntity;
        if (!unitWithCreatedAt.createdAt) return false;
        const unitCreatedAt = new Date(unitWithCreatedAt.createdAt);
        unitCreatedAt.setHours(0, 0, 0, 0);
        return unitCreatedAt <= ngayCuoiThang;
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

        // Kiểm tra xem hợp đồng có giao với tháng này không
        // Hợp đồng giao với tháng nếu: ngày bắt đầu <= ngày cuối tháng VÀ ngày kết thúc >= ngày đầu tháng
        if (
          ngayBatDauThue.getTime() <= ngayCuoiThang.getTime() &&
          ngayKetThucThue.getTime() >= ngayDauThang.getTime()
        ) {
          unitIdsDangChoThue.add(hopDong.unitId);
        }
      });

      const soDonViDangChoThue = unitIdsDangChoThue.size;

      result[monthKey] = {
        tongSoDonViThue: tongSoDonViChoThue,
        soDonViDangChoThue: soDonViDangChoThue,
      };
    }

    return result;
  }
  async thongKeDoanhThuTaiSanTheoThang(
    user: AuthUser,
    thangBatDau: Date,
    thangKetThuc: Date,
  ) {
    const thangBatDauDate = new Date(thangBatDau);
    const ngayBatDauStart = new Date(
      thangBatDauDate.getFullYear(),
      thangBatDauDate.getMonth(),
      1,
    );
    ngayBatDauStart.setHours(0, 0, 0, 0);

    const thangKetThucDate = new Date(thangKetThuc);
    const ngayKetThucEnd = new Date(
      thangKetThucDate.getFullYear(),
      thangKetThucDate.getMonth() + 1,
      0,
    );
    ngayKetThucEnd.setHours(23, 59, 59, 999);

    const properties = await this.propertieService.getMany({
      where: {
        userId: user.id,
      },
      attributes: ['_id', 'code', 'ten', 'diaChi', 'tinhThanhPho', 'createdAt'],
    });

    const hoaDons = await this.hoaDonChoThueService.getMany({
      where: {
        userId: user.id,
        trangThai: HoaDonTrangThai.DA_THANH_TOAN,
        ngayXacNhanThanhToan: {
          [Op.ne]: null,
          [Op.gte]: ngayBatDauStart,
          [Op.lte]: ngayKetThucEnd,
        },
      },
      include: [
        {
          model: HopDongThueModel,
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
      ],
    });

    const getMonthsInRange = (start: Date, end: Date): string[] => {
      const months: string[] = [];
      const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(end.getFullYear(), end.getMonth(), 1);

      while (currentDate <= endDate) {
        months.push(formatMonth(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return months;
    };

    const monthsInRange = getMonthsInRange(ngayBatDauStart, ngayKetThucEnd);

    const result: Record<
      string,
      Array<{
        taiSan: {
          _id: string;
          code: string;
          ten: string;
          diaChi: string;
          tinhThanhPho?: string;
        };
        doanhThu: number;
      }>
    > = {};

    for (const monthKey of monthsInRange) {
      const [year, month] = monthKey.split('/').map(Number);
      const ngayCuoiThang = new Date(year, month, 0);
      ngayCuoiThang.setHours(23, 59, 59, 999);

      result[monthKey] = [];

      for (const propertie of properties) {
        const propertieWithCreatedAt = propertie as Propertie & BaseEntity;
        if (!propertieWithCreatedAt.createdAt) {
          continue;
        }

        const propertieCreatedAt = new Date(propertieWithCreatedAt.createdAt);
        if (propertieCreatedAt <= ngayCuoiThang) {
          result[monthKey].push({
            taiSan: {
              _id: propertie._id,
              code: propertie.code,
              ten: propertie.ten,
              diaChi: propertie.diaChi,
              tinhThanhPho: propertie.tinhThanhPho,
            },
            doanhThu: 0,
          });
        }
      }
    }

    for (const hoaDon of hoaDons) {
      const hoaDonWithRelations = hoaDon as HoaDon & {
        hopDongThue: {
          unit: {
            propertie: Propertie;
          };
        };
      };

      const ngayXacNhanThanhToan = hoaDon.ngayXacNhanThanhToan;
      if (!ngayXacNhanThanhToan) {
        continue;
      }

      const monthKey = formatMonth(new Date(ngayXacNhanThanhToan));
      const propertie = hoaDonWithRelations.hopDongThue?.unit?.propertie;

      if (!propertie || !result[monthKey]) {
        continue;
      }

      const taiSanIndex = result[monthKey].findIndex(
        (item) => item.taiSan._id === propertie._id,
      );

      if (taiSanIndex >= 0) {
        result[monthKey][taiSanIndex].doanhThu += Number(hoaDon.tongTien) || 0;
      }
    }

    const sortedResult: Record<
      string,
      Array<{
        taiSan: {
          _id: string;
          code: string;
          ten: string;
          diaChi: string;
          tinhThanhPho?: string;
        };
        doanhThu: number;
      }>
    > = {};

    const sortedMonths = monthsInRange.sort((a, b) => {
      const [yearA, monthA] = a.split('/').map(Number);
      const [yearB, monthB] = b.split('/').map(Number);
      if (yearA !== yearB) {
        return yearB - yearA;
      }
      return monthB - monthA;
    });

    for (const month of sortedMonths) {
      sortedResult[month] = result[month];
    }

    return sortedResult;
  }
  async thongKeDoanhThuTaiSanById(
    user: AuthUser,
    taiSanId: string,
    thangBatDau: Date,
    thangKetThuc: Date,
  ) {
    // Tính ngày đầu và cuối khoảng thời gian
    const thangBatDauDate = new Date(thangBatDau);
    const ngayBatDauStart = new Date(
      thangBatDauDate.getFullYear(),
      thangBatDauDate.getMonth(),
      1,
    );
    ngayBatDauStart.setHours(0, 0, 0, 0);

    const thangKetThucDate = new Date(thangKetThuc);
    const ngayKetThucEnd = new Date(
      thangKetThucDate.getFullYear(),
      thangKetThucDate.getMonth() + 1,
      0,
    );
    ngayKetThucEnd.setHours(23, 59, 59, 999);

    // Lấy hóa đơn đã thanh toán trong khoảng thời gian, lọc theo tài sản ID
    const hoaDons = await this.hoaDonChoThueService.getMany({
      where: {
        userId: user.id,
        trangThai: HoaDonTrangThai.DA_THANH_TOAN,
        ngayXacNhanThanhToan: {
          [Op.ne]: null,
          [Op.gte]: ngayBatDauStart,
          [Op.lte]: ngayKetThucEnd,
        },
      },
      include: [
        {
          model: HopDongThueModel,
          required: true,
          include: [
            {
              model: UnitModel,
              where: {
                propertieId: taiSanId,
              },
              include: [
                {
                  model: PropertieModel,
                },
              ],
            },
          ],
        },
      ],
    });

    const getMonthsInRange = (start: Date, end: Date): string[] => {
      const months: string[] = [];
      const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(end.getFullYear(), end.getMonth(), 1);

      while (currentDate <= endDate) {
        months.push(formatMonth(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return months;
    };

    const monthsInRange = getMonthsInRange(ngayBatDauStart, ngayKetThucEnd);

    // Khởi tạo kết quả với tất cả các tháng (doanh thu = 0)
    const result: Record<string, number> = {};
    for (const monthKey of monthsInRange) {
      result[monthKey] = 0;
    }

    // Tính tổng doanh thu theo tháng (đã được lọc từ database)
    for (const hoaDon of hoaDons) {
      const ngayXacNhanThanhToan = hoaDon.ngayXacNhanThanhToan;
      if (!ngayXacNhanThanhToan) {
        continue;
      }

      const monthKey = formatMonth(new Date(ngayXacNhanThanhToan));
      if (result[monthKey] !== undefined) {
        result[monthKey] += Number(hoaDon.tongTien) || 0;
      }
    }

    // Sắp xếp kết quả theo thứ tự thời gian (mới nhất trước)
    const sortedResult: Record<string, number> = {};
    const sortedMonths = monthsInRange.sort((a, b) => {
      const [yearA, monthA] = a.split('/').map(Number);
      const [yearB, monthB] = b.split('/').map(Number);
      if (yearA !== yearB) {
        return yearB - yearA; // Năm mới nhất trước
      }
      return monthB - monthA; // Tháng mới nhất trước
    });

    for (const month of sortedMonths) {
      sortedResult[month] = result[month];
    }

    return sortedResult;
  }
}
