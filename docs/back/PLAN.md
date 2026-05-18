# BACK Plan - Dau Thau Va Dau Gia

> **For agentic workers:** Khi trien khai code tu plan nay, dung workflow task-by-task, viet test truoc cho scoring/validation quan trong, commit nho theo tung module.

**Goal:** Xay dung backend NestJS cho dau thau va dau gia dua tren scoring rules trong `docs/chung/ALL.md`.

**Architecture:** Them cac module rieng cho tender, auction, scoring va realtime/audit. Giu pattern hien co cua repo: `controllers`, `services`, `repositories`, `entities`, `models`, `dto`, Sequelize model, BaseRepository/BaseService.

**Tech Stack:** NestJS 11, Sequelize, PostgreSQL, class-validator, @nestjs/swagger, JWT auth/role guard hien co.

---

## 1. Nguyen Tac Trien Khai

- Khong tron logic scoring vao controller.
- Scoring engine la service rieng, co unit test doc lap.
- Moi submission/bid phai validate status phien, quyen user va hard constraint truoc khi tinh diem.
- Criteria va weight duoc dong bang sau khi phien `OPEN`.
- Ket qua scoring phai luu breakdown de giai thich va audit.
- API response theo response interceptor hien co cua repo.
- Dung decorator auth/role hien co khi bao ve endpoint.

## 2. Module De Xuat

```text
src/modules/scoring
  common/
  dto/
  services/

src/modules/tender
  common/
  controllers/
  dto/
  entities/
  models/
  repositories/
  services/

src/modules/auction
  common/
  controllers/
  dto/
  entities/
  models/
  repositories/
  services/

src/modules/audit-log
  controllers/
  dto/
  entities/
  models/
  repositories/
  services/
```

Co the hoan `audit-log` sang phase sau, nhung cac service nen de san hook `createAuditLog()`.

## 3. Data Model

### 3.1 Common Enums

File de xuat: `src/modules/scoring/common/constants.ts`

```typescript
export enum LoaiPhien {
  DAU_THAU = 'DAU_THAU',
  DAU_GIA = 'DAU_GIA',
}

export enum TrangThaiPhien {
  NHAP = 'NHAP',
  CONG_BO = 'CONG_BO',
  MO = 'MO',
  DONG = 'DONG',
  HUY = 'HUY',
}

export enum LoaiTieuChi {
  SO = 'SO',
  PHAN_TRAM = 'PHAN_TRAM',
  DUNG_SAI = 'DUNG_SAI',
  LUA_CHON = 'LUA_CHON',
  TAI_LIEU = 'TAI_LIEU',
}

export enum TrangThaiDeXuat {
  CHO_DUYET = 'CHO_DUYET',
  HOP_LE = 'HOP_LE',
  BI_TU_CHOI = 'BI_TU_CHOI',
  DAN_DAU = 'DAN_DAU',
  THANG = 'THANG',
  THUA = 'THUA',
}

export enum HuongToiUu {
  CAO_HON = 'CAO_HON',
  THAP_HON = 'THAP_HON',
}
```

### 3.2 TenderSession

Bang: `phien_dau_thau`

```typescript
{
  _id: string;
  tieuDe: string;
  moTa?: string;
  chuPhienId: string;
  trangThai: TrangThaiPhien;
  thoiGianBatDau: Date;
  thoiGianKetThuc: Date;
  giaToiDa?: number;
  trongSoKyThuat: number; // default 0.6
  trongSoGia: number; // default 0.4
  diemKyThuatToiThieu: number; // default 50
  anDanh: boolean;
  thoiDiemCongBo?: Date;
  thoiDiemDong?: Date;
  deXuatThangId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes:

- `chuPhienId`
- `trangThai`
- `thoiGianBatDau`
- `thoiGianKetThuc`

### 3.3 TenderCriteria

Bang: `tieu_chi_dau_thau`

```typescript
{
  _id: string;
  phienId: string;
  tenTieuChi: string;
  maTieuChi: string;
  nhom: 'sang_loc' | 'ky_thuat' | 'thuong_mai' | 'gia_tri' | 'rui_ro';
  loai: LoaiTieuChi;
  trongSo: number;
  huongToiUu: HuongToiUu;
  batBuoc: boolean;
  rangBuocCung: boolean;
  cacLuaChon?: Array<{ nhan: string; giaTri: string; diem: number }>;
  giaTriToiThieu?: number;
  giaTriToiDa?: number;
  donVi?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Rules:

- `maTieuChi` unique trong mot phien.
- Tong `trongSo` cua criteria dung scoring bang 1 hoac 100 tuy convention, chon 1 va normalize trong service.
- `TAI_LIEU`/`DUNG_SAI` co the la rang buoc cung.

### 3.4 TenderSubmission

Bang: `de_xuat_dau_thau`

```typescript
{
  _id: string;
  phienId: string;
  nguoiThamGiaId: string;
  trangThai: TrangThaiDeXuat;
  giaDeXuat: number;
  diemKyThuat?: number;
  diemGia?: number;
  diemTongHop?: number;
  thuHang?: number;
  lyDoTuChoi?: string;
  thoiDiemNop: Date;
  updatedAt: Date;
}
```

Unique:

- `(phienId, nguoiThamGiaId)` neu moi bidder chi co 1 proposal active.

### 3.5 TenderSubmissionValue

Bang: `gia_tri_de_xuat`

```typescript
{
  _id: string;
  deXuatId: string;
  tieuChiId: string;
  giaTriSo?: number;
  giaTriChuoi?: string;
  giaTriDungSai?: boolean;
  giaTriJson?: object;
  giaTriGoc: object;
  diemChuanHoa?: number;
  diemCoTrongSo?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.6 AuctionSession

Bang: `phien_dau_gia`

```typescript
{
  _id: string;
  tieuDe: string;
  moTa?: string;
  chuPhienId: string;
  trangThai: TrangThaiPhien;
  thoiGianBatDau: Date;
  thoiGianKetThuc: Date;
  giaKhoiDiem: number;
  giaHienTai: number;
  buocGia: number;
  tienDatCoc?: number;
  trongSoGia: number; // default 0.8
  trongSoUyTin: number; // default 0.2
  trongSoCamKet?: number;
  anDanh: boolean;
  nguoiDanDauId?: string;
  thoiDiemDong?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.7 AuctionBid

Bang: `gia_dau_gia`

```typescript
{
  _id: string;
  phienDauGiaId: string;
  nguoiDungId: string;
  giaTrao: number;
  diemGia?: number;
  diemUyTin?: number;
  diemCamKet?: number;
  diemTongHop?: number;
  trangThai: TrangThaiDeXuat;
  thoiDiemDat: Date;
  thuTuServer: number;
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes:

- `(phienDauGiaId, giaTrao)`
- `(phienDauGiaId, thoiDiemDat)`
- `(phienDauGiaId, thuTuServer)` unique.

### 3.8 AuditLog

Bang: `nhat_ky_kiem_toan`

```typescript
{
  _id: string;
  nguoiThucHienId?: string;
  hanhDong: string;
  loaiDoiTuong: string;
  doiTuongId: string;
  truocKhi?: object;
  sauKhi?: object;
  duLieuBoSung?: object;
  createdAt: Date;
}
```

## 4. Scoring Service

File de xuat: `src/modules/scoring/services/scoring.service.ts`

### 4.1 API Noi Bo

```typescript
normalizeNumber(value: number, min: number, max: number, isReverse: boolean): number
normalizeBoolean(value: boolean, trueScore?: number, falseScore?: number): number
normalizeEnum(value: string, options: EnumScoreOption[]): number
calculateWeightedScore(items: Array<{ score: number; weight: number }>): number
calculateTenderPriceScore(price: number, minPrice: number): number
calculateAuctionPriceScore(price: number, maxPrice: number): number
calculateTenderFinalScore(technicalScore: number, priceScore: number, weights: TenderWeights): number
calculateAuctionFinalScore(priceScore: number, trustScore: number, commitmentScore?: number, weights?: AuctionWeights): number
```

### 4.2 Quy Tac Can Test

- `normalizeNumber(500, 500, 700, true) = 100`
- `normalizeNumber(700, 500, 700, true) = 0`
- `normalizeNumber(5, 1, 5, false) = 100`
- `max == min` tra 100.
- Price dau thau voi `price <= 0` throw BadRequest.
- Price dau gia voi `maxPrice <= 0` throw BadRequest.
- Tong weight khong bang 1 thi service normalize hoac reject theo config.

## 5. Tender API Contract

### 5.1 Tao Phien Dau Thau

```http
POST /tender-sessions
Authorization: Bearer <token>
```

Request:

```json
{
  "tieuDe": "Goi thau thiet bi y te",
  "moTa": "Mua sam thiet bi cho benh vien",
  "thoiGianBatDau": "2026-05-20T02:00:00.000Z",
  "thoiGianKetThuc": "2026-05-25T10:00:00.000Z",
  "giaToiDa": 1000000000,
  "trongSoKyThuat": 0.6,
  "trongSoGia": 0.4,
  "diemKyThuatToiThieu": 50,
  "anDanh": true,
  "tieuChi": [
    {
      "tenTieuChi": "Kinh nghiem",
      "maTieuChi": "experience",
      "nhom": "ky_thuat",
      "loai": "SO",
      "trongSo": 0.4,
      "huongToiUu": "CAO_HON",
      "batBuoc": true,
      "rangBuocCung": false,
      "donVi": "hop dong"
    }
  ]
}
```

Response:

```json
{
  "_id": "TEN-001",
  "trangThai": "NHAP"
}
```

Validation:

- `thoiGianKetThuc > thoiGianBatDau`.
- `trongSoKyThuat + trongSoGia = 1`.
- `maTieuChi` khong trung.
- Tong technical criteria `trongSo` hop le.
- `giaToiDa > 0` neu co.

### 5.2 Publish Phien

```http
POST /tender-sessions/:id/publish
```

Rules:

- Chi host/admin duoc publish.
- Phien phai la `NHAP`.
- Co it nhat 1 tieu chi scoring hoac dung scoring mac dinh.
- Sau publish khong cho sua tieu chi neu khong co versioning.

### 5.3 Nop Proposal

```http
POST /tender-sessions/:id/submissions
```

Request:

```json
{
  "giaDeXuat": 900000000,
  "cacGiaTri": [
    { "maTieuChi": "experience", "giaTri": 3 },
    { "maTieuChi": "revenue", "giaTri": 6 },
    { "maTieuChi": "rating", "giaTri": 4 }
  ]
}
```

Response:

```json
{
  "deXuatId": "SUB-001",
  "trangThai": "HOP_LE",
  "diemKyThuat": 69,
  "diemGia": 88.89,
  "diemTongHop": 76.96,
  "thuHang": 2,
  "chiTiet": [
    {
      "maTieuChi": "experience",
      "giaTriGoc": 3,
      "diemChuanHoa": 60,
      "diemCoTrongSo": 24
    }
  ]
}
```

Rules:

- User dang nhap.
- Phien `MO`.
- `giaDeXuat > 0`.
- Neu `giaDeXuat > giaToiDa` thi reject.
- Neu thieu tieu chi bat buoc thi reject.
- Tinh lai `Gmin` va ranking sau moi proposal hop le.

### 5.4 Lay Ranking

```http
GET /tender-sessions/:id/ranking
```

Response:

```json
{
  "phienId": "TEN-001",
  "trangThai": "MO",
  "danhSach": [
    {
      "thuHang": 1,
      "deXuatId": "SUB-001",
      "bietDanh": "Bidder A",
      "diemKyThuat": 86,
      "diemGia": 88.89,
      "diemTongHop": 87.16,
      "trangThai": "HOP_LE"
    }
  ]
}
```

Permission:

- Host/Admin xem day du.
- Bidder xem minh va biet danh an danh cua nguoi khac.

### 5.5 Dong Phien

```http
POST /tender-sessions/:id/close
```

Rules:

- Host/admin hoac cron khi het `thoiGianKetThuc`.
- Tinh ranking cuoi.
- Gan winner.
- Chuyen cac de xuat khac sang `THUA`.
- Ghi audit log.

## 6. Auction API Contract

### 6.1 Tao Phien Dau Gia

```http
POST /auction-sessions
```

Request:

```json
{
  "tieuDe": "Dong ho Rolex Submariner",
  "moTa": "Tai san dau gia",
  "thoiGianBatDau": "2026-05-20T02:00:00.000Z",
  "thoiGianKetThuc": "2026-05-20T04:00:00.000Z",
  "giaKhoiDiem": 250000000,
  "buocGia": 5000000,
  "tienDatCoc": 25000000,
  "trongSoGia": 0.8,
  "trongSoUyTin": 0.2,
  "anDanh": true
}
```

Validation:

- `giaKhoiDiem > 0`.
- `buocGia > 0`.
- `thoiGianKetThuc > thoiGianBatDau`.
- Tong trong so hop le.

### 6.2 Dat Gia

```http
POST /auction-sessions/:id/bids
```

Request:

```json
{
  "giaTrao": 255000000
}
```

Response:

```json
{
  "thanhCong": true,
  "giaId": "BID-001",
  "giaCaoNhat": 255000000,
  "giaToiThieuKeTiep": 260000000,
  "dangDanDau": true,
  "thongBao": "Ban dang la nguoi dan dau"
}
```

Rules:

- User dang nhap.
- Phien `MO`.
- `giaTrao >= giaHienTai + buocGia`.
- Neu chua co gia, `giaTrao >= giaKhoiDiem`.
- Ghi `thuTuServer` de xu ly tranh chap cung thoi diem.
- Cap nhat `giaHienTai` va `nguoiDanDauId` trong transaction.
- Neu gia khong con hop le do co gia moi, tra `409 Conflict` kem `giaCaoNhat` va `giaToiThieuKeTiep`.

### 6.3 Lay Trang Thai Dau Gia

```http
GET /auction-sessions/:id/status
```

Response:

```json
{
  "phienDauGiaId": "AUC-X1",
  "giaHienTai": 255000000,
  "bietDanhNguoiDanDau": "User 12",
  "tongSoLuotDat": 15,
  "buocGia": 5000000,
  "giaHopLeKeTiep": 260000000,
  "thoiGianServer": "2026-05-18T03:00:00.000Z",
  "thoiGianKetThuc": "2026-05-18T04:00:00.000Z",
  "trangThai": "MO"
}
```

### 6.4 Dong Phien Dau Gia

```http
POST /auction-sessions/:id/close
```

Rules:

- Host/admin hoac cron.
- Bid cao nhat hop le la winner.
- Neu co scoring trust/commitment, dung `diemTongHop` de xep hang.
- Tao ket qua va audit log.

## 7. Transaction Va Concurrency

### 7.1 Dau Gia

Dat gia phai chay trong transaction:

1. Lock auction session row.
2. Doc `giaHienTai`.
3. Validate `giaTrao >= giaHienTai + buocGia`.
4. Tao `AuctionBid`.
5. Cap nhat `giaHienTai`, `nguoiDanDauId`.
6. Commit.

Neu PostgreSQL isolation khong du, dung row-level lock cua Sequelize transaction.

### 7.2 Dau Thau

Submit proposal:

1. Validate phien `trangThai`.
2. Upsert de xuat neu cho phep sua proposal.
3. Luu gia tri.
4. Tinh scoring.
5. Recalculate ranking cua phien.

De tranh ranking sai khi nhieu de xuat dong thoi, dung transaction hoac queue recalculation.

## 8. Realtime

Phase dau co the dung polling. Khi them realtime, de xuat:

- WebSocket gateway hoac SSE endpoint.
- Events:
  - `tender.ranking.updated`
  - `auction.bid.created`
  - `auction.leading.changed`
  - `session.closed`

Backend service sau khi commit transaction moi emit event.

## 9. Cron Jobs

Mo/dong phien tu dong:

- Moi phut scan phien `CONG_BO` co `thoiGianBatDau <= now` va chuyen sang `MO`.
- Moi phut scan phien `MO` co `thoiGianKetThuc <= now` va close.

Repo da co `src/modules/cron-job`, nen them job vao module nay thay vi tao scheduler rieng.

## 10. Testing Plan

### 10.1 Unit Test Scoring

File de xuat:

```text
src/modules/scoring/services/scoring.service.spec.ts
```

Cases:

- Number normalize reverse/non-reverse.
- Boolean scoring.
- Enum scoring.
- Weight calculation.
- Tender price score.
- Auction price score.
- Edge case chia 0.

### 10.2 Unit Test TenderService

Cases:

- Tao phien fail khi trong so sai.
- Publish fail khi trang thai khong phai NHAP.
- Submit fail khi phien chua MO.
- Submit fail khi gia <= 0.
- Submit fail khi gia vuot gia toi da.
- Submit hop le khi diem ky thuat >= nguong.
- Submit bi tu choi khi diem ky thuat < nguong.
- Ranking sap xep theo diem tong hop giam dan.

### 10.3 Unit Test AuctionService

Cases:

- Tao dau gia fail khi gia khoi diem <= 0.
- Dat gia fail khi phien chua MO.
- Dat gia fail khi gia trao < gia hop le ke tiep.
- Dat gia thanh cong cap nhat gia hien tai/nguoi dan dau.
- Dat gia conflict tra gia toi thieu moi.
- Dong phien gan winner.

### 10.4 E2E Test

Flow tender:

```text
register/login host
create tender session
publish/open session
register/login bidder
submit proposal
get ranking
close session
verify winner
```

Flow auction:

```text
register/login host
create auction session
publish/open session
register/login participant
place bid
get status
close session
verify winner
```

## 11. Thu Tu Trien Khai BACK

### Phase BACK-1: Scoring Foundation

- Tao `scoring` module.
- Tao constants/enums.
- Tao `ScoringService`.
- Viet unit test cho formula.
- Export service cho tender/auction.

### Phase BACK-2: Tender Data Layer

- Tao `TenderSession` entity/model/repository.
- Tao `TenderCriteria` entity/model/repository.
- Tao `TenderSubmission` entity/model/repository.
- Tao `TenderSubmissionValue` entity/model/repository.
- Dang ky Sequelize models trong module.

### Phase BACK-3: Tender Service/API

- DTO tao/sua/publish phien.
- DTO submit proposal.
- `TenderSessionService`: create, publish, open, close.
- `TenderSubmissionService`: submit, validate, score, rank.
- `TenderController`: endpoints trong muc 5.
- Swagger decorators.

### Phase BACK-4: Auction Data Layer

- Tao `AuctionSession` entity/model/repository.
- Tao `AuctionBid` entity/model/repository.
- Dang ky Sequelize models.

### Phase BACK-5: Auction Service/API

- DTO tao phien dau gia.
- DTO dat gia.
- `AuctionSessionService`: create, publish/open, close.
- `AuctionBidService`: place bid transaction, status, history.
- `AuctionController`: endpoints trong muc 6.
- Xu ly `409 Conflict` cho bid loi thoi.

### Phase BACK-6: Cron Va Realtime Fallback

- Them cron open/close session vao `cron-job`.
- Them endpoint status/ranking toi uu cho polling.
- Neu co thoi gian, them WebSocket/SSE events.

### Phase BACK-7: Audit Va Hardening

- Them audit log cho action quan trong.
- Rate limit endpoint bid/submit.
- Permission check Host/Admin/Bidder.
- An danh participant theo `isAnonymous`.

## 12. Definition Of Done Cho BACK

- Formula scoring co unit test pass.
- API tao phien, publish, submit/bid, ranking/status, close hoat dong.
- Validation dung business rule trong `docs/chung/ALL.md`.
- Dau gia dat gia dong thoi khong lam sai `currentPrice`.
- Swagger hien request/response chinh.
- E2E pass cho tender va auction happy path.
- Khong controller nao chua business logic scoring truc tiep.
