
import { TrangThaiXacNhanNoiDungHoaDon } from '../common/constant';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class XacNhanNoiDungHoaDonDto {
    @IsEnum(TrangThaiXacNhanNoiDungHoaDon)
    trangThaiXacNhan: TrangThaiXacNhanNoiDungHoaDon;
    @IsString()
    @IsOptional()
    ghiChu?: string;
}
