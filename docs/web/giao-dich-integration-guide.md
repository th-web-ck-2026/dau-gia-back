# Giao Dich Hau Ky - Web Integration Guide

Tai lieu nay huong dan Web Client ghep feature giao dich hau dau gia / dau thau sau khi backend da xac dinh nguoi thang.

## 1. Muc tieu UI

Sau khi mot phien dau gia hoac dau thau co winner, backend tao 1 ban ghi `giao_dich`. Web can cung cap 3 trai nghiem chinh:

- Nguoi thang xem giao dich cua minh, xac nhan hoac tu choi trong 48 gio.
- Hai ben thuc hien cac buoc hau ky theo tung loai phien.
- Hai ben chi thay thong tin lien he sau khi nguoi thang da xac nhan.

De xuat route:

```text
/giao-dich
/giao-dich/:id
```

Neu frontend da co khu vuc "Tai khoan cua toi" hoac "Quan ly phien", co the dat danh sach giao dich trong cac tab sau:

```text
/me/giao-dich
/host/giao-dich
```

## 2. Enum backend can map

### `loaiPhien`

```text
DAU_GIA
DAU_THAU
```

### `trangThai`

```text
CHO_XAC_NHAN
CHO_THANH_TOAN
DA_THANH_TOAN
CHO_KY_HOP_DONG
DA_KY_HOP_DONG
DANG_BAN_GIAO
HOAN_TAT
THAT_BAI
DA_HUY
```

Goi y label UI:

| State | Label |
|---|---|
| `CHO_XAC_NHAN` | Cho nguoi thang xac nhan |
| `CHO_THANH_TOAN` | Cho thanh toan |
| `DA_THANH_TOAN` | Da bao chuyen khoan |
| `CHO_KY_HOP_DONG` | Cho ky hop dong |
| `DA_KY_HOP_DONG` | Da ky hop dong |
| `DANG_BAN_GIAO` | Dang ban giao |
| `HOAN_TAT` | Hoan tat |
| `THAT_BAI` | That bai |
| `DA_HUY` | Da huy |

## 3. API client

Tat ca endpoint can token dang nhap.

```ts
type LoaiPhien = 'DAU_GIA' | 'DAU_THAU';

type TrangThaiGiaoDich =
  | 'CHO_XAC_NHAN'
  | 'CHO_THANH_TOAN'
  | 'DA_THANH_TOAN'
  | 'CHO_KY_HOP_DONG'
  | 'DA_KY_HOP_DONG'
  | 'DANG_BAN_GIAO'
  | 'HOAN_TAT'
  | 'THAT_BAI'
  | 'DA_HUY';

interface GiaoDich {
  _id: string;
  phienId: string;
  loaiPhien: LoaiPhien;
  chuPhienId: string;
  nguoiThangId: string;
  trangThai: TrangThaiGiaoDich;
  giaChot?: number | null;
  hanXacNhan: string;
  thoiDiemXacNhan?: string | null;
  lyDoThatBai?: 'TU_CHOI' | 'QUA_HAN' | string | null;
  anhChungTu?: string[];
  thoiDiemNguoiThangBaoDaCK?: string | null;
  thoiDiemChuPhienXacNhanTien?: string | null;
  chuPhienDaKy?: boolean;
  nguoiThangDaKy?: boolean;
  daBanGiao?: boolean;
  nguoiThangXacNhanNhan?: boolean;
  ghiChuLienHeChuPhien?: string | null;
  ghiChuLienHeNguoiThang?: string | null;
  thoiDiemHoanTat?: string | null;
  lienHe?: {
    chuPhien: ContactInfo | null;
    nguoiThang: ContactInfo | null;
  };
  thongTinChuyenKhoan?: {
    tenNganHang: string | null;
    soTaiKhoan: string | null;
    tenTaiKhoan: string | null;
    soTien: number | null;
    noiDungCK: string;
  };
}

interface ContactInfo {
  fullname?: string;
  email?: string;
  phone?: string;
  diaChi?: string | null;
}
```

API methods:

```text
GET  /giao-dich/me?trangThai=&loaiPhien=&page=&limit=
GET  /giao-dich/:id
POST /giao-dich/:id/xac-nhan
POST /giao-dich/:id/tu-choi
PUT  /giao-dich/:id/ghi-chu
POST /giao-dich/:id/da-chuyen-khoan
POST /giao-dich/:id/xac-nhan-tien
POST /giao-dich/:id/hoan-tat
POST /giao-dich/:id/ky-hop-dong
POST /giao-dich/:id/ban-giao
POST /giao-dich/:id/xac-nhan-nhan
POST /giao-dich/:id/huy
```

Body:

```jsonc
// PUT /giao-dich/:id/ghi-chu
{ "ghiChu": "Hen giao hang 9h sang mai" }

// POST /giao-dich/:id/da-chuyen-khoan
{ "anhChungTu": ["https://.../chung-tu.jpg"] }
```

## 4. Danh sach giao dich

Man hinh danh sach nen co:

- Tabs: Tat ca, Dau gia, Dau thau.
- Filter state: dang xu ly, hoan tat, that bai/da huy.
- Badge vai tro: "Ban la chu phien" hoac "Ban la nguoi thang".
- Countdown cho `CHO_XAC_NHAN`: tinh tu `hanXacNhan`.
- CTA theo state: "Xem chi tiet", "Xac nhan ngay", "Thanh toan", "Ky hop dong".

Query khuyen dung:

```text
GET /giao-dich/me?page=1&limit=10
GET /giao-dich/me?loaiPhien=DAU_GIA&trangThai=CHO_THANH_TOAN
```

## 5. Chi tiet giao dich

Luon hien:

- Ma giao dich `_id`.
- Loai phien.
- Trang thai.
- Han xac nhan neu state la `CHO_XAC_NHAN`.
- Gia chot neu co.
- Timeline cac moc thoi gian co du lieu.

Chi hien khoi lien he khi API tra `lienHe`. Backend chi tra lien he sau khi giao dich khong con o `CHO_XAC_NHAN` va khong phai `THAT_BAI`.

Neu API khong co `lienHe`, khong render email/phone/dia chi va hien text ngan: "Thong tin lien he se duoc mo sau khi nguoi thang xac nhan."

## 6. Action theo vai tro va state

Frontend nen tinh vai tro tu token user id:

```ts
const isChuPhien = giaoDich.chuPhienId === currentUser.id;
const isNguoiThang = giaoDich.nguoiThangId === currentUser.id;
```

Bang action:

| State | Vai tro | Action |
|---|---|---|
| `CHO_XAC_NHAN` | Nguoi thang | `xac-nhan`, `tu-choi` |
| Non-terminal | Chu phien | `huy` |
| Co `lienHe` | Chu phien / Nguoi thang | `ghi-chu` |
| `CHO_THANH_TOAN` | Nguoi thang | `da-chuyen-khoan` |
| `DA_THANH_TOAN` | Chu phien | `xac-nhan-tien`, sau do `hoan-tat` |
| `CHO_KY_HOP_DONG` | Chu phien / Nguoi thang | `ky-hop-dong` |
| `DA_KY_HOP_DONG` | Chu phien | `ban-giao` |
| `DANG_BAN_GIAO` | Nguoi thang | `xac-nhan-nhan` |

Terminal states:

```text
HOAN_TAT
THAT_BAI
DA_HUY
```

Khong hien action chuyen trang thai trong terminal states.

## 7. Luong dau gia

### `CHO_XAC_NHAN`

Nguoi thang thay:

- Nut "Xac nhan giao dich".
- Nut "Tu choi".
- Countdown 48 gio.

Chu phien thay:

- Trang thai cho nguoi thang xac nhan.
- Nut "Huy giao dich" neu muon ket thuc som.

### `CHO_THANH_TOAN`

Nguoi thang thay thong tin chuyen khoan:

- Ten ngan hang.
- So tai khoan.
- Ten tai khoan.
- So tien.
- Noi dung chuyen khoan.

Sau khi chuyen khoan, nguoi thang upload anh chung tu qua module upload hien co, lay URL va goi:

```text
POST /giao-dich/:id/da-chuyen-khoan
```

### `DA_THANH_TOAN`

Chu phien thay:

- Anh chung tu.
- Nut "Xac nhan da nhan tien".
- Sau khi da xac nhan tien, hien nut "Hoan tat giao dich".

Backend bat buoc chu phien goi `xac-nhan-tien` truoc khi `hoan-tat`.

## 8. Luong dau thau

### `CHO_KY_HOP_DONG`

Hai ben thay:

- Trang thai chu phien da ky: `chuPhienDaKy`.
- Trang thai nguoi thang da ky: `nguoiThangDaKy`.
- Nut "Toi da ky hop dong" neu ben hien tai chua ky.

Khi ca hai ben da ky, backend chuyen sang `DA_KY_HOP_DONG`.

### `DA_KY_HOP_DONG`

Chu phien thay nut:

```text
Ban giao
```

### `DANG_BAN_GIAO`

Nguoi thang thay nut:

```text
Xac nhan da nhan
```

Sau khi xac nhan, backend chuyen `HOAN_TAT`.

## 9. Xu ly loi tren Web

Backend co cac guard quan trong:

- Sai vai tro: 403.
- Sai state: 400.
- Khong tim thay giao dich: 404.
- Qua han xac nhan: cron co the da chuyen sang `THAT_BAI`, nen action `xac-nhan` co the fail 400.

Sau moi action thanh cong hoac that bai, Web nen refetch:

```text
GET /giao-dich/:id
```

De tranh UI stale khi cron hoac nguoi dung khac vua doi state.

## 10. Luu y khi ghep voi ket qua phien

Sau khi host/admin evaluate phien dau gia/dau thau, backend se tao giao dich. Neu tao giao dich loi, API evaluate se tra loi loi thay vi tiep tuc thanh cong ngam. Web nen hien loi:

```text
Da xac dinh ket qua nhung khong tao duoc giao dich hau ky. Vui long thu lai hoac lien he quan tri vien.
```

Khong nen tu tao giao dich tren frontend. Frontend chi doc `/giao-dich/me` hoac dieu huong nguoi dung vao chi tiet giao dich sau khi backend tra ve/thong bao co giao dich.

## 11. Checklist tich hop

- [ ] Tao API client cho cac endpoint `/giao-dich`.
- [ ] Tao enum label/state badge dung 9 state hien tai.
- [ ] Tao trang danh sach giao dich cua toi.
- [ ] Tao trang chi tiet dung chung cho dau gia va dau thau.
- [ ] An thong tin lien he khi response chua co `lienHe`.
- [ ] Render action theo vai tro + state.
- [ ] Upload anh chung tu truoc khi goi `da-chuyen-khoan`.
- [ ] Refetch chi tiet sau moi action.
- [ ] Xu ly 400/403/404 thanh message ro rang.
- [ ] Test luong dau gia: xac nhan -> chuyen khoan -> xac nhan tien -> hoan tat.
- [ ] Test luong dau thau: xac nhan -> hai ben ky -> ban giao -> xac nhan nhan.
