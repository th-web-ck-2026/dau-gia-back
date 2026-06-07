# Spec — Module `giao-dich` (luồng hậu đấu giá / đấu thầu)

> Ngày: 2026-06-07
> Trạng thái: Draft — chờ user review
> Plan gốc liên quan: `docs/back/PLAN.md`, `STATE.md` (sau BACK-11)

## 1. Bối cảnh & mục tiêu

Hiện hệ thống đã hoàn tất tới bước **xác định người thắng**:
- `auction.service.evaluateSession` → gửi `AUCTION_WON` (`auction.service.ts:389`), đóng phiên.
- `tender.service.evaluateSession` → gửi `TENDER_WON` (`tender.service.ts:446`), đóng phiên.

Sau khi có người thắng, **chưa có gì xảy ra**: không xác nhận, không thanh toán, không hợp đồng, không trao đổi liên hệ.

Module `giao-dich` bổ sung **luồng hậu kỳ** cho cả hai loại phiên, dùng chung một bản ghi giao dịch và một state machine.

### Phạm vi đã chốt với user

| Hạng mục | Quyết định |
|---|---|
| Đấu thầu (tender) | Xác nhận → ký hợp đồng → bàn giao → hoàn tất. **Không** thanh toán. |
| Đấu giá (auction) | Xác nhận → thanh toán → hoàn tất. |
| Trao đổi liên hệ | Cả 2 loại: lộ thông tin liên hệ 2 bên + mỗi bên có ô ghi chú liên hệ. |
| Nguồn thông tin liên hệ | Từ `user` profile (`email`, `phone`, `diaChi`). Đọc realtime, không snapshot. |
| Thời hạn xác nhận | 48 giờ kể từ khi tạo giao dịch. |
| Người thắng từ chối / quá hạn | Chỉ đánh dấu `THAT_BAI`. **Không** tự mời người kế tiếp. |
| Báo cáo người bỏ kèo | Tái dùng module `bao-cao-user` sẵn có (`POST /bao-cao-user`), không thêm endpoint. |
| Mức thanh toán (auction) | Mock + hiển thị thông tin chuyển khoản (STK chủ phiên, số tiền, nội dung CK) + ảnh chứng từ optional. Không cổng thật. |
| Mức hợp đồng (tender) | Chỉ nút "Đã ký" cho mỗi bên (không file). Đủ 2 bên → đã ký. |
| Bàn giao (tender) | Có bước `DANG_BAN_GIAO`: chủ phiên đánh dấu đã bàn giao → người thắng xác nhận đã nhận → `HOAN_TAT`. |
| Kiến trúc | Hướng 1 — một module `giao-dich` dùng chung cho cả 2 loại, rẽ nhánh theo `loaiPhien`. |

## 2. State machine

Enum `TrangThaiGiaoDich`:
`CHO_XAC_NHAN, DA_XAC_NHAN, CHO_THANH_TOAN, DA_THANH_TOAN, CHO_KY_HOP_DONG, DA_KY_HOP_DONG, DANG_BAN_GIAO, HOAN_TAT, THAT_BAI, DA_HUY`

### Trạng thái khởi tạo & nhánh chung

```
(evaluateSession chốt winner)
        │
        ▼
  CHO_XAC_NHAN ──(người thắng từ chối)──────────────► THAT_BAI   (terminal)
        │       ──(quá 48h, cron)──────────────────► THAT_BAI   (terminal)
        │
   (người thắng xác nhận)
        ▼
  DA_XAC_NHAN  ── rẽ nhánh theo loaiPhien ──
```

Từ `DA_XAC_NHAN` trở đi: mở thông tin liên hệ 2 bên + ô ghi chú.
Mọi trạng thái không-terminal: chủ phiên có thể `DA_HUY` (optional).

### Nhánh ĐẤU GIÁ (DAU_GIA)

```
DA_XAC_NHAN
   │ (hệ thống tự set ngay)
   ▼
CHO_THANH_TOAN ──(người thắng: da-chuyen-khoan + ảnh)──► DA_THANH_TOAN
                                                              │
                                       (chủ phiên: xac-nhan-tien)
                                                              ▼
                                                          (cho phép) hoan-tat ──► HOAN_TAT
```
- `CHO_THANH_TOAN`: FE hiển thị `thongTinChuyenKhoan` (STK/tên/nội dung CK) + `giaChot`.
- `xac-nhan-tien`: chủ phiên xác nhận đã nhận tiền (cập nhật `thoiDiemChuPhienXacNhanTien`); sau đó chủ phiên bấm `hoan-tat`.

### Nhánh ĐẤU THẦU (DAU_THAU)

```
DA_XAC_NHAN
   │ (hệ thống tự set ngay)
   ▼
CHO_KY_HOP_DONG ──(mỗi bên: ky-hop-dong)──► (đủ 2 bên) ──► DA_KY_HOP_DONG
                                                                │
                                          (chủ phiên: ban-giao)
                                                                ▼
                                                          DANG_BAN_GIAO
                                                                │
                                       (người thắng: xac-nhan-nhan)
                                                                ▼
                                                            HOAN_TAT
```
- `ky-hop-dong`: set `chuPhienDaKy` hoặc `nguoiThangDaKy` = true tùy requester. Khi cả hai true → `DA_KY_HOP_DONG`.

## 3. Data model

### Enum — `src/modules/giao-dich/common/constants.ts`
- `TrangThaiGiaoDich` (10 giá trị như trên).
- Tái dùng `LoaiPhien` từ `scoring/common/constants.ts` (DAU_GIA / DAU_THAU).

### Entity `giao_dich` — 1 record / 1 phiên có winner

| Field | Kiểu | Ghi chú |
|---|---|---|
| `_id` | uuid | PK |
| `phienId` | uuid | id phiên nguồn (auction/tender session) |
| `loaiPhien` | enum LoaiPhien | DAU_GIA / DAU_THAU |
| `chuPhienId` | uuid | chủ phiên |
| `nguoiThangId` | uuid | người thắng |
| `trangThai` | enum TrangThaiGiaoDich | mặc định `CHO_XAC_NHAN` |
| `giaChot` | number nullable | giá thắng (auction); tender có thể null |
| `hanXacNhan` | timestamp | thời điểm tạo + 48h |
| `thoiDiemXacNhan` | timestamp nullable | khi người thắng xác nhận |
| `lyDoThatBai` | string nullable | `TU_CHOI` / `QUA_HAN` |
| **Thanh toán (auction)** | | |
| `thongTinChuyenKhoan` | jsonb/text nullable | snapshot STK/tên/nội dung CK lúc tạo |
| `anhChungTu` | string[] nullable | ảnh chứng từ CK |
| `thoiDiemNguoiThangBaoDaCK` | timestamp nullable | |
| `thoiDiemChuPhienXacNhanTien` | timestamp nullable | |
| **Hợp đồng (tender)** | | |
| `chuPhienDaKy` | boolean | default false |
| `nguoiThangDaKy` | boolean | default false |
| **Bàn giao (tender)** | | |
| `daBanGiao` | boolean | default false (chủ phiên đánh dấu) |
| `nguoiThangXacNhanNhan` | boolean | default false |
| **Liên hệ (chung)** | | |
| `ghiChuLienHeChuPhien` | text nullable | ô ghi chú chủ phiên |
| `ghiChuLienHeNguoiThang` | text nullable | ô ghi chú người thắng |
| `thoiDiemHoanTat` | timestamp nullable | |

> Thông tin liên hệ (email/phone/diaChi) **không lưu trong entity** — đọc realtime từ `user` khi `trangThai >= DA_XAC_NHAN` để tránh dữ liệu cũ.

### Model / Repository
- `GiaoDichModel` (Sequelize), `GiaoDichRepository` extends `BaseRepository`.
- Service extends `BaseService` theo pattern repo.

## 4. API — prefix `/giao-dich`

| Method | Route | Vai | Tác dụng | Trạng thái nguồn → đích |
|---|---|---|---|---|
| GET | `/me` | người thắng / chủ phiên | list giao dịch của tôi (filter `trangThai`, `loaiPhien`) | — |
| GET | `/:id` | 2 bên liên quan | chi tiết + liên hệ + ghi chú (nếu `>= DA_XAC_NHAN`) | — |
| POST | `/:id/xac-nhan` | người thắng | đồng ý nhận | `CHO_XAC_NHAN` → `DA_XAC_NHAN` (→ auto nhánh) |
| POST | `/:id/tu-choi` | người thắng | từ chối | `CHO_XAC_NHAN` → `THAT_BAI` |
| PUT | `/:id/ghi-chu` | 2 bên | cập nhật ghi chú liên hệ của chính mình | `>= DA_XAC_NHAN` |
| POST | `/:id/da-chuyen-khoan` | người thắng (auction) | báo đã CK + ảnh | `CHO_THANH_TOAN` → `DA_THANH_TOAN` |
| POST | `/:id/xac-nhan-tien` | chủ phiên (auction) | xác nhận nhận tiền | `DA_THANH_TOAN` (set mốc thời gian) |
| POST | `/:id/hoan-tat` | chủ phiên (auction) | chốt hoàn tất | `DA_THANH_TOAN` → `HOAN_TAT` |
| POST | `/:id/ky-hop-dong` | 2 bên (tender) | đánh dấu mình đã ký | `CHO_KY_HOP_DONG` → (đủ 2) `DA_KY_HOP_DONG` |
| POST | `/:id/ban-giao` | chủ phiên (tender) | đánh dấu đã bàn giao | `DA_KY_HOP_DONG` → `DANG_BAN_GIAO` |
| POST | `/:id/xac-nhan-nhan` | người thắng (tender) | xác nhận đã nhận | `DANG_BAN_GIAO` → `HOAN_TAT` |
| POST | `/:id/huy` | chủ phiên | hủy giao dịch (optional) | non-terminal → `DA_HUY` |

Báo cáo người bỏ kèo: tái dùng `POST /bao-cao-user`, không thêm route.

### DTO
- `condition-giao-dich.dto.ts` (filter cho `/me`).
- `da-chuyen-khoan.dto.ts` (`anhChungTu: string[]`).
- `ghi-chu.dto.ts` (`ghiChu: string`).
- Các action còn lại không cần body (chỉ `:id` + identity từ JWT).

## 5. Tích hợp

### Tạo giao dịch
- Trong `evaluateSession` (cả `auction.service` và `tender.service`), sau khi xác định winner và gửi `*_WON`, gọi `giaoDichService.taoTuPhien({ phienId, loaiPhien, chuPhienId, nguoiThangId, giaChot, thongTinChuyenKhoan? })`.
- Inject `GiaoDichService` vào `AuctionModule` / `TenderModule`.
- **Tránh circular DI**: `GiaoDichModule` KHÔNG import lại `AuctionModule`/`TenderModule`; chỉ nhận dữ liệu winner truyền vào qua `taoTuPhien`.
- Idempotent: nếu đã có giao dịch cho `phienId` thì bỏ qua (tránh tạo trùng khi re-evaluate).

### Cron quá hạn 48h
- Thêm job trong `cron-job.service`: quét `trangThai = CHO_XAC_NHAN` và `hanXacNhan < now` → set `THAT_BAI`, `lyDoThatBai = QUA_HAN`, notify chủ phiên + người thắng.

### Notification (tái dùng `createNotification`)
Type mới (string, theo cách `AUCTION_WON` đang dùng):
- `GIAODICH_CAN_XAC_NHAN` — gửi người thắng khi tạo.
- `GIAODICH_CAN_THANH_TOAN` — auction, khi vào `CHO_THANH_TOAN`.
- `GIAODICH_DA_THANH_TOAN` — chủ phiên, khi người thắng báo CK.
- `GIAODICH_CAN_KY_HD` — tender, khi vào `CHO_KY_HOP_DONG`.
- `GIAODICH_CAN_BAN_GIAO` / `GIAODICH_CAN_XAC_NHAN_NHAN` — tender.
- `GIAODICH_HOAN_TAT` — cả 2 bên.
- `GIAODICH_THAT_BAI` — cả 2 bên.

### Audit log (tái dùng `audit-log`)
- Hook `createAuditLog()` vào các action chuyển trạng thái quan trọng: xác nhận, từ chối, báo CK, xác nhận tiền, ký HD, bàn giao, hoàn tất, hủy.

## 6. Quyền & validation

- **Role/identity guard**: mỗi action kiểm tra requester đúng vai (`chuPhienId` vs `nguoiThangId`) trên chính record; sai vai → 403.
- **State guard**: mỗi action chỉ hợp lệ ở đúng `trangThai` nguồn; sai → `ApiError` (409/400).
- **Idempotency**: ký hợp đồng lặp lại không cộng dồn; báo CK 2 lần không tạo trùng mốc.

## 7. Testing

- `giao-dich.service.spec.ts`: mỗi chuyển trạng thái 2 nhánh; từ chối; quá hạn (cron); idempotent tạo & ký.
- `giao-dich.controller.spec.ts`: phân quyền chủ phiên vs người thắng; sai vai 403; sai state 409.
- Mock `NotificationService`, `AuditLogService`, `Sequelize.transaction` theo pattern spec hiện có. Mục tiêu: không phá vỡ bộ test hiện tại (đang 83/83 pass).

## 8. Cấu trúc thư mục (theo pattern `bao-cao-user`)

```
src/modules/giao-dich/
├── giao-dich.module.ts
├── controllers/giao-dich.controller.ts
├── services/giao-dich.service.ts
├── services/giao-dich.service.spec.ts
├── repositories/giao-dich.repository.ts
├── models/giao-dich.model.ts
├── entities/giao-dich.entity.ts
├── dto/condition-giao-dich.dto.ts
├── dto/da-chuyen-khoan.dto.ts
├── dto/ghi-chu.dto.ts
└── common/constants.ts
```

## 9. Cập nhật STATE.md
- Thêm phase mới (vd `BACK-12: Giao Dịch Hậu Kỳ`) vào bảng tổng quan + chi tiết sau khi implement.

## 10. Ngoài phạm vi (YAGNI)
- Không tích hợp cổng thanh toán thật.
- Không sinh file hợp đồng / template.
- Không tự động mời người kế tiếp khi winner bỏ kèo.
- Không chat realtime (chỉ ô ghi chú + lộ liên hệ).
- Không snapshot thông tin liên hệ user.
