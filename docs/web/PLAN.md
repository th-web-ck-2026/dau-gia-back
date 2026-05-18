# WEB Plan - Dau Thau Va Dau Gia

## 1. Muc Tieu

WEB can cung cap trai nghiem day du cho 4 nhom nguoi dung: guest, participant/bidder, host/owner va admin. Tai lieu nay tap trung vao man hinh, flow, state va API interaction. Chi tiet business rule chung nam tai `docs/chung/ALL.md`; chi tiet backend nam tai `docs/back/PLAN.md`.

## 2. Pham Vi WEB

### 2.1 Trong Pham Vi

- Danh sach phien dau thau/dau gia.
- Chi tiet phien.
- Tao va cau hinh phien cho Host.
- Criteria builder cho dau thau.
- Form nop proposal dau thau.
- Man hinh dat gia dau gia realtime.
- Bang xep hang.
- Ket qua va bien ban sau khi ket thuc.
- Admin moderation co ban.

### 2.2 Ngoai Pham Vi Giai Doan Dau

- Thanh toan that.
- Ky so hop dong that.
- OCR/xac thuc tai lieu tu dong.
- Proxy bidding nang cao neu backend chua san sang.

## 3. Dieu Huong De Xuat

```text
/sessions
/sessions/:id
/host/sessions
/host/sessions/new
/host/sessions/:id/edit
/host/sessions/:id/ranking
/bidder/submissions
/admin/sessions
/admin/users
```

Neu frontend hien tai dung routing khac, giu pattern hien co va map cac route tren sang convention cua project.

## 4. Man Hinh Chinh

### 4.1 Danh Sach Phien

Muc tieu:

- Nguoi dung tim va loc phien co the tham gia.

Thanh phan:

- Tabs: Dau thau, Dau gia.
- Filter: trang thai, thoi gian, danh muc, gia khoi diem/goi thau, tu khoa.
- Card/table item: ten phien, loai, trang thai, thoi gian con lai, gia hien tai/gia goi thau, so nguoi tham gia.

API:

```text
GET /tender-sessions
GET /auction-sessions
```

### 4.2 Chi Tiet Phien Dau Thau

Muc tieu:

- Bidder xem thong tin va nop proposal.
- Host xem tong quan phien va ranking.

Thanh phan:

- Header: ten phien, status, countdown, host.
- Thong tin goi thau: mo ta, gia tran, yeu cau phap ly.
- Criteria table: ten, type, weight, huong toi uu, constraint.
- CTA: nop proposal, sua proposal neu con thoi gian, xem ranking.

State:

- `DRAFT`: chi Host thay.
- `PUBLISHED`: hien thong tin, chua cho nop.
- `OPEN`: cho nop proposal.
- `CLOSED`: chi xem ket qua.

### 4.3 Form Proposal Dau Thau

Muc tieu:

- Thu thap du lieu theo criteria dong.

Field render theo type:

| Criteria type | UI control                    |
| ------------- | ----------------------------- |
| `number`      | Number input co min/max/unit. |
| `percent`     | Number input + suffix `%`.    |
| `boolean`     | Checkbox/toggle.              |
| `enum`        | Select/radio.                 |
| `document`    | Upload file hoac URL file.    |

Validation client-side:

- Required theo criteria.
- Number > 0 neu la price/budget.
- Price <= maxBudget neu criteria co constraint.
- Percent trong khoang 0-100.
- Document file size/type hop le.
- Weight khong lien quan form participant, chi hien de minh bach.

Validation server-side:

- Hien loi tu backend theo field.
- Hard constraint violation (blacklist, KYC, price cap) hien error ro rang.

Sau khi submit:

- Hien total score neu backend cho phep.
- Hien breakdown diem cua proposal hien tai.
- Hien rank neu phien cho cong khai ranking.

### 4.4 Chi Tiet Phien Dau Gia

Muc tieu:

- Participant dat gia nhanh, ro dieu kien hop le.

Thanh phan:

- Tai san dau gia: ten, anh, mo ta, gia khoi diem.
- Countdown theo server time.
- Current highest price.
- Next valid bid.
- Bid input.
- Nut dat gia.
- Lich su gia cong khai/an danh tuy cau hinh.

Validation truoc submit:

```text
bidAmount >= nextValidBid
bidAmount > 0
user da KYC neu phien yeu cau
phien dang OPEN
```

Sau khi submit:

- Success: cap nhat current price, next valid bid, vi tri dan dau.
- Error: hien message ngan gon, giu gia tri de nguoi dung sua.

### 4.5 Bang Xep Hang

Muc tieu:

- Host/Admin theo doi ket qua.
- Bidder xem thong tin duoc phep.

Cot de xuat:

- Rank.
- Participant alias.
- Total score.
- Price score.
- Technical/trust score.
- Status.
- Last update.

Quyen hien thi:

- Host/Admin: xem day du.
- Bidder: xem rank cua minh va thong tin an danh cua doi thu.
- Guest: chi xem neu phien public result.

### 4.6 Ket Qua Va Bien Ban

Muc tieu:

- Cong bo winner va buoc tiep theo.

Thanh phan:

- Winner.
- Diem/gia thang.
- Breakdown scoring.
- Thoi diem ket thuc.
- Trang thai thanh toan/ky hop dong.
- Tai bien ban neu co.

## 5. Realtime UX

Uu tien dung WebSocket/SSE neu backend co. Neu chua co, fallback polling.

Events WEB can xu ly:

```text
session.updated
tender.submission.created
tender.ranking.updated
auction.bid.created
auction.leading.changed
auction.closed
```

Polling fallback:

- Dau gia dang mo: 3-5 giay/lua chon.
- Dau thau ranking: 5-10 giay/lua chon.
- Khi tab hidden: giam polling hoac pause.

## 6. Loading, Empty, Error States

Bat buoc co:

- Loading danh sach phien.
- Empty khi chua co phien.
- Empty ranking khi chua co proposal/bid.
- Error 401: yeu cau dang nhap.
- Error 403: khong co quyen.
- Error 409: phien da dong, bid khong con hop le, proposal bi conflict.
- Error validation theo field.

## 7. Bao Mat UX

- Khong hien thong tin ca nhan doi thu neu phien an danh.
- Khong tin vao clock client; countdown can dong bo voi `serverTime`.
- Nut submit bi disable khi dang gui request.
- Sau loi bid thap hon gia moi, WEB cap nhat `nextValidBid` tu response.
- Hien canh bao khi Host sua criteria lam tong weight khong bang 100%.

## 8. Thu Tu Trien Khai WEB

### Phase WEB-1: Nen Tang Man Hinh

- Tao route danh sach phien.
- Tao route chi tiet phien.
- Tao service API client cho tender/auction.
- Tao state model cho session status.

### Phase WEB-2: Dau Thau

- Criteria table.
- Dynamic proposal form.
- Submit proposal.
- Ranking view.
- Result view.

### Phase WEB-3: Dau Gia

- Auction detail.
- Bid input + validation.
- Bid history.
- Realtime/polling status update.
- Closed result view.

### Phase WEB-4: Host/Admin

- Host session list.
- Create/edit tender session.
- Criteria builder.
- Create/edit auction session.
- Admin moderation.

### Phase WEB-5: Chat Luong

- E2E flow: tao phien -> submit/bid -> ranking -> close.
- Mobile layout.
- Error states.
- Permission states.

## 9. Definition Of Done Cho WEB

- Moi man hinh co loading, empty, error state.
- Form validate truoc khi goi API va hien loi backend.
- Countdown dung server time.
- Khong lo thong tin nhay cam cua participant khac.
- Ranking update duoc bang realtime hoac polling.
- Co test/manual checklist cho flow chinh.
