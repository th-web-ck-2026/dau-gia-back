export class AuctionRankingItem {
  thuHang: number;
  bidId: string;
  nguoiThamGiaId: string;
  bietDanh: string;
  giaDat: number;
  diemGia: number;
  diemTongHop: number;
  trangThai: string;
  thoiDiemDat: Date;
}

export class AuctionRankingResponse {
  phienId: string;
  trangThai: string;
  danhSach: AuctionRankingItem[];
}

export class AuctionRankingOrMessage {
  phienId?: string;
  trangThai?: string;
  danhSach?: AuctionRankingItem[];
  message?: string;
}
