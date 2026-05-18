# Tai Lieu Chung - Dau Thau Va Dau Gia

## 1. Muc Tieu

He thong ho tro 2 nghiep vu chinh:

- Dau thau: host tao phien, nha thau nop de xuat, he thong cham diem theo tieu chi va trong so de xep hang.
- Dau gia: don vi to chuc tao phien, nguoi tham gia dat gia theo vong/thoi gian thuc, he thong xac dinh nguoi dan dau va nguoi thang.

Tai lieu chung nay la nguon chuan cho WEB va BACK. Cac tai lieu chi tiet:

- WEB: `docs/web/PLAN.md`
- BACK: `docs/back/PLAN.md`

## 2. Thuat Ngu

| Thuat ngu           | Y nghia                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| Host/Owner          | Nguoi hoac to chuc tao phien dau thau/dau gia.                              |
| Bidder              | Nguoi tham gia dau thau, nop proposal/de xuat.                              |
| Auction Participant | Nguoi tham gia dau gia, dat gia mua/tai san.                                |
| Tender Session      | Phien dau thau.                                                             |
| Auction Session     | Phien dau gia.                                                              |
| Criteria            | Tieu chi danh gia.                                                          |
| Weight              | Trong so cua tieu chi, tong trong so hop le bang 100%.                      |
| Technical Score     | Diem nang luc/ky thuat cua nha thau.                                        |
| Price Score         | Diem gia. Dau thau uu tien gia thap hop le, dau gia uu tien gia cao hop le. |
| Final Score         | Diem tong hop dung de xep hang.                                             |
| Hard Constraint     | Dieu kien loai truc tiep, vi du blacklist, khong KYC, gia vuot tran.        |
| Bid Increment       | Buoc gia toi thieu trong dau gia.                                           |
| Proxy Bidding       | Dau gia tu dong theo gia toi da nguoi dung da cau hinh.                     |

## 3. Tac Nhan He Thong

### 3.1 Host/Owner

Vai tro:

- Tao phien dau thau hoac dau gia.
- Thiet lap thong tin phien, thoi gian bat dau, thoi gian ket thuc.
- Thiet lap tieu chi danh gia va trong so.
- Theo doi bang xep hang.
- Ket thuc phien va cong bo ket qua.

Vi du doi tuong:

- Doanh nghiep.
- Co quan nha nuoc.
- Startup goi von.
- Ban to chuc su kien.
- Ca nhan dau gia tai san.

### 3.2 Bidder/Nguoi Tham Gia

Vai tro:

- Dang ky/dang nhap tai khoan.
- Tham gia phien hop le.
- Gui proposal trong dau thau hoac dat gia trong dau gia.
- Theo doi trang thai, diem, thu hang neu duoc phep hien thi.
- Ky bien ban/hop dong va thanh toan neu trung.

### 3.3 Admin

Vai tro:

- Kiem duyet phien.
- Quan ly nguoi dung.
- Khoa tai khoan vi pham.
- Theo doi du lieu va xu ly tranh chap.

### 3.4 System

Vai tro:

- Xac thuc nguoi dung.
- Kiem tra tinh hop le cua proposal/bid.
- Cham diem theo cau hinh tieu chi.
- Xep hang.
- Cap nhat realtime.
- Dong phien khi het han.
- Ghi log phuc vu audit.

## 4. Nghiep Vu Dau Thau

### 4.1 Muc Tieu

Dau thau dung de chon nha thau/phuong an tot nhat dua tren nhieu tieu chi: nang luc, gia, tien do, uy tin, bao hanh, tai chinh va dieu kien phap ly.

### 4.2 Nhom Tieu Chi Mac Dinh

| Nhom       | Tieu chi thanh phan                     | Cach cham    | Trong so tham khao | Muc dich                                    |
| ---------- | --------------------------------------- | ------------ | ------------------ | ------------------------------------------- |
| Sang loc   | Phap ly, tien ky quy, blacklist, KYC    | Pass/Fail    | Bat buoc           | Loai nha thau khong du dieu kien.           |
| Nang luc   | Kinh nghiem, tai chinh, nhan su, uy tin | Diem 0-100   | 40%-60%            | Dam bao kha nang thuc hien hop dong.        |
| Thuong mai | Gia du thau, thanh toan, bao hanh       | Cong thuc so | 40%-60%            | Tim phuong an toi uu ve chi phi va loi ich. |

### 4.3 Quy Tac Sang Loc

Nha thau bi loai truoc khi cham diem neu gap mot trong cac dieu kien:

- Khong xac thuc danh tinh/to chuc theo yeu cau.
- Nam trong blacklist.
- Gia de xuat nho hon hoac bang 0.
- Gia de xuat vuot tran goi thau neu goi thau co gia tran.
- Khong dap ung dieu kien phap ly bat buoc.
- Khong nop du tai lieu bat buoc.

### 4.4 Technical Score

Diem nang luc ky thuat T tinh theo thang 0-100.

| Tieu chi    | Cach tinh                             | Trong so noi bo | Diem toi da |
| ----------- | ------------------------------------- | --------------- | ----------- |
| Kinh nghiem | So hop dong tuong tu x 20, toi da 100 | 40%             | 40          |
| Tai chinh   | Theo moc doanh thu: 100/70/40         | 30%             | 30          |
| Uy tin san  | So sao trung binh x 20                | 30%             | 30          |

Cong thuc:

```text
T = (experienceScore x 0.4) + (financialScore x 0.3) + (trustScore x 0.3)
```

Nguong loai:

```text
Neu T < 50 thi loai nha thau.
```

Vi du:

```text
experienceScore = 3 hop dong x 20 = 60
financialScore = 70
trustScore = 4 sao x 20 = 80
T = 60 x 0.4 + 70 x 0.3 + 80 x 0.3 = 69
```

### 4.5 Price Score Cho Dau Thau

Dau thau uu tien gia thap hop le.

```text
P = (Gmin / Gi) x 100
```

Trong do:

- P: diem gia cua nha thau dang xet.
- Gmin: gia hop le thap nhat trong cac nha thau qua vong sang loc.
- Gi: gia cua nha thau dang xet.

Edge cases:

- `Gi <= 0`: tu choi proposal.
- `Gi > ceilingPrice`: loai neu goi thau co gia tran.
- Khong co proposal hop le: khong tinh ranking.

### 4.6 Final Score Cho Dau Thau

```text
Total = (T x Wt) + (P x Wp)
Wt + Wp = 1
Mac dinh: Wt = 0.6, Wp = 0.4
```

Trang thai ket qua:

- `BI_TU_CHOI`: khong qua sang loc hoac diem ky thuat duoi nguong.
- `HOP_LE`: hop le va duoc xep hang.
- `THANG`: diem cao nhat sau khi dong phien.

## 5. Nghiep Vu Dau Gia

### 5.1 Muc Tieu

Dau gia dung de chon nguoi tra gia/nguoi mua phu hop nhat dua tren gia, cam ket va uy tin. Mac dinh gia cao hon co loi the, nhung he thong co the tinh them diem uy tin de giam rui ro bo coc.

### 5.2 Nhom Tieu Chi Mac Dinh

| Nhom    | Tieu chi                             | Cach cham            | Trong so tham khao |
| ------- | ------------------------------------ | -------------------- | ------------------ |
| Gia     | Muc gia tra                          | Tu dong realtime     | 70%-80%            |
| Cam ket | Dat coc, thoi gian dat gia           | Uu tien theo rule    | 10%-20%            |
| Uy tin  | Lich su dau gia, thanh toan, vi pham | Diem 0-100 hoac loai | 10%-20%            |

### 5.3 Price Score Cho Dau Gia

Dau gia uu tien gia cao hop le.

```text
Pi = (Gi / Gmax) x 100
```

Trong do:

- Pi: diem gia cua nguoi dang xet.
- Gi: gia cua nguoi dang xet.
- Gmax: gia cao nhat hop le tai thoi diem cham.

### 5.4 Commitment Score

Dung de uu tien khi co gia bang nhau hoac khi phien yeu cau cam ket cao.

Quy tac tham khao:

- Cung gia: nguoi dat lenh truoc duoc uu tien.
- Tien coc cao hon muc toi thieu co the duoc cong diem.
- Dat gia khong du buoc nhay bi tu choi.

```text
newBidAmount >= currentHighestAmount + bidIncrement
```

### 5.5 Trust Score

| Hang muc  | Dieu kien                           | Diem            |
| --------- | ----------------------------------- | --------------- |
| Kim cuong | Hoan thanh tren 10 phien thanh cong | 100             |
| Vang      | Hoan thanh 1-10 phien thanh cong    | 70              |
| Moi       | Chua co lich su                     | 50              |
| Vi pham   | Tung thang nhung bo coc/blacklist   | Loai hoac -1000 |

### 5.6 Final Score Cho Dau Gia

Mac dinh:

```text
Total = (P x 0.8) + (U x 0.2)
```

Neu co cam ket:

```text
Total = (P x priceWeight) + (C x commitmentWeight) + (U x trustWeight)
priceWeight + commitmentWeight + trustWeight = 1
```

### 5.7 Luong Dau Gia Theo Vong

Vi du 1 phien co 3 vong, moi vong 5 phut:

1. Vong 1: nguoi tham gia dat gia bang gia khoi diem.
2. Vong 2: nguoi tham gia tang gia theo buoc nhay.
3. Vong 3: nguoi tra gia cao nhat hop le la nguoi dan dau.
4. Het thoi gian: he thong dong phien, xac dinh ket qua, tao bien ban/hop dong.

## 6. Nguyen Tac Xay Dung Criteria

| Nguyen tac                   | Yeu cau he thong                                           |
| ---------------------------- | ---------------------------------------------------------- |
| Phan anh muc tieu kinh doanh | Host chon muc tieu: cost, speed, quality, trust.           |
| Da tieu chi                  | Cho tao nhieu criteria, gioi han khuyen nghi 4-7 tieu chi. |
| Dinh luong duoc              | Ho tro number, percent, boolean, enum, document.           |
| Chuan hoa diem               | Moi tieu chi quy ve thang 0-100.                           |
| Trong so hop ly              | Tong weight bang 100%; canh bao neu mot tieu chi qua 60%.  |
| Khong trung lap              | Kiem tra trung ten/loai tieu chi.                          |
| Huong toi uu ro              | Moi criteria co `isReverse`: true la cang thap cang tot.   |
| Co dieu kien loai            | Hard constraints chay truoc scoring.                       |
| Minh bach                    | Luu breakdown diem tung tieu chi.                          |
| Audit duoc                   | Luu lich su thay doi criteria, weight va ket qua.          |

## 7. Chuan Hoa Diem Criteria

### 7.1 Number Criteria

Cang cao cang tot:

```text
score = (value - min) / (max - min) x 100
```

Cang thap cang tot:

```text
score = (max - value) / (max - min) x 100
```

Edge case:

```text
Neu max == min thi score = 100
```

### 7.2 Boolean Criteria

Mac dinh:

```text
true = 100
false = 0
```

Co the cau hinh nguoc neu nghiep vu yeu cau.

### 7.3 Enum Criteria

Enum can mapping diem ro rang:

```json
{
  "basic": 40,
  "standard": 70,
  "premium": 100
}
```

### 7.4 Document Criteria

Tai lieu phap ly, chung chi, ho so nang luc thuong dung cho pass/fail:

- Co tai lieu hop le: pass.
- Khong co hoac het han: fail.
- Can admin kiem duyet neu tai lieu khong the xac thuc tu dong.

## 8. User Stories Chinh

### US1 - Tao Phien Dau Thau

La Host, toi muon tao phien dau thau de cac nha thau gui de xuat canh tranh.

Acceptance criteria:

- Nhap ten phien/du an.
- Chon thoi gian bat dau va ket thuc.
- Thiet lap criteria.
- Thiet lap weight.
- Luu nhap hoac cong bo phien.

### US2 - Thiet Lap Criteria Linh Hoat

La Host, toi muon tao criteria linh hoat de cham diem theo nhieu yeu to khac nhau.

Acceptance criteria:

- Them/sua/xoa criteria truoc khi publish.
- Chon kieu du lieu: number, percent, boolean, enum, document.
- Chon huong toi uu.
- Tong weight hop le bang 100%.

### US3 - Gui Proposal Dau Thau

La Bidder, toi muon gui proposal de he thong tinh diem va xep hang.

Acceptance criteria:

- Chi gui proposal khi phien dang mo.
- Du lieu proposal dap ung criteria.
- He thong tinh diem va tra ve breakdown.
- Proposal bi tu choi neu vi pham hard constraint.

### US4 - Xem Bang Xep Hang Realtime

La Bidder/Host, toi muon xem bang xep hang theo thoi gian thuc de theo doi ket qua.

Acceptance criteria:

- Bang xep hang cap nhat khi co proposal/bid moi.
- Hien thi diem tong va breakdown theo quyen truy cap.
- Khong lo thong tin nhay cam cua doi thu neu phien yeu cau bao mat.

### US5 - Ket Thuc Phien

La Host/System, toi muon ket thuc phien de xac dinh nguoi thang.

Acceptance criteria:

- Het thoi gian thi phien tu dong dong.
- He thong tinh ranking cuoi.
- Nguoi thang duoc gan trang thai winner.
- Ket qua duoc cong bo va ghi audit log.

## 9. Trang Thai Chuan

### 9.1 Session Status

| Status    | Y nghia                           |
| --------- | --------------------------------- |
| `NHAP`    | Dang tao, chua cong bo.           |
| `CONG_BO` | Da cong bo, chua den gio bat dau. |
| `MO`      | Dang nhan proposal/bid.           |
| `DONG`    | Da dong, khong nhan du lieu moi.  |
| `HUY`     | Bi huy.                           |

### 9.2 Submission/Bid Status

| Status       | Y nghia                              |
| ------------ | ------------------------------------ |
| `CHO_DUYET`  | Da nhan, cho tinh diem/kiem duyet.   |
| `HOP_LE`     | Hop le.                              |
| `BI_TU_CHOI` | Bi tu choi do constraint/validation. |
| `DAN_DAU`    | Dang dan dau phien dau gia.          |
| `THANG`      | Trung thau/trung dau gia.            |
| `THUA`       | Khong thang.                         |

## 10. Mock Data Chuan

### 10.1 Tender Result

```json
{
  "nguoiThamGiaId": "BID-789",
  "tenGoiThau": "Goi thau thiet bi y te",
  "danhGia": {
    "kyThuat": {
      "diemKinhNghiem": 80,
      "diemTaiChinh": 100,
      "diemUyTin": 90,
      "diemKyThuat": 91,
      "diemKyThuatCoTrongSo": 54.6
    },
    "thuongMai": {
      "giaDeXuat": 900000000,
      "giaThapNhatTrenThi": 800000000,
      "diemGia": 88.89,
      "diemGiaCoTrongSo": 35.56
    },
    "ketQuaCuoi": {
      "diemTongHop": 90.16,
      "thuHang": 1,
      "trangThai": "HOP_LE",
      "khuyenNghi": "THANG"
    }
  }
}
```

### 10.2 Auction Status

```json
{
  "phienDauGiaId": "AUC-X1",
  "tenTaiSan": "Dong ho Rolex Submariner",
  "trangThaiDauGia": {
    "giaHienTai": 250000000,
    "bietDanhNguoiDanDau": "User 12",
    "tongSoLuotDat": 15,
    "buocGia": 5000000,
    "giaHopLeKeTiep": 255000000,
    "thoiGianServer": "2026-05-18T03:00:00.000Z",
    "thoiGianKetThuc": "2026-05-18T04:00:00.000Z",
    "trangThai": "MO"
  },
  "chongBot": {
    "daXacMinh": true,
    "soLanConLai": 3
  }
}
```

## 11. Nguyen Tac Bao Mat Va Cong Bang

- Moi request tao proposal/bid phai co user xac thuc.
- Phien co bao mat danh tinh khong hien ten that cua nguoi tham gia cho doi thu.
- Ket qua scoring phai co breakdown de giai thich.
- Criteria va weight khong duoc sua sau khi phien da `MO`, tru khi co co che versioning va cong bo lai.
- Moi thay doi quan trong can audit log: tao phien, publish, sua criteria, submit, bid, close, cancel, cong bo winner.
- He thong phai chan bid/proposal spam bang rate limit hoac anti-bot.
