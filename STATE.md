# PLAN STATE — dau-gia-back

> **AI workers: Đọc file này trước khi làm bất kỳ task nào. Cập nhật ngay sau khi hoàn thành một phase.**
> Plan gốc: `docs/back/PLAN.md`

---

## Trạng thái tổng quan

| Phase | Tên | Trạng thái |
|-------|-----|------------|
| BACK-1 | Scoring Engine | ✅ DONE |
| BACK-2 | Tender Data Layer | ✅ DONE |
| BACK-3 | Tender Service/API | ✅ DONE |
| BACK-4 | Auction Data Layer | ✅ DONE |
| BACK-5 | Auction Service/API | ✅ DONE |
| BACK-6 | Cron & Realtime Fallback | ⏳ IN PROGRESS (stub only) |
| BACK-7 | Audit & Hardening | ❌ NOT STARTED |

**Đang ở:** Bắt đầu BACK-6 — cron-job service hiện chỉ là stub rỗng.

---

## Chi tiết từng phase

### ✅ BACK-1: Scoring Engine
- `src/modules/scoring/common/constants.ts` — enums đầy đủ (LoaiPhien, TrangThaiPhien, LoaiTieuChi, HuongToiUu, TrangThaiDeXuat...)
- `src/modules/scoring/services/scoring.service.ts` — 132 dòng, có normalizeNumber, scoreTender, scoreAuction
- `src/modules/scoring/services/scoring.service.spec.ts` — unit test có (nhưng chưa chạy được do Node v14 không tương thích ts-jest mới)
- `src/modules/scoring/scoring.module.ts` — đã đăng ký

### ✅ BACK-2: Tender Data Layer
- Entity: `tender-session`, `tender-criteria`, `tender-submission`, `tender-submission-value`
- Model Sequelize: đủ 4 model
- Repository: đủ 4 repository

### ✅ BACK-3: Tender Service/API
- `tender.service.ts` — 495 dòng: createSession, publishSession, submitProposal, evaluateSession, closeSession, getSessionDetails, getRanking, getSubmissions
- `tender.controller.ts` — endpoints: POST /, POST :id/publish, POST submissions, POST :id/evaluate, GET :id, GET :id/ranking, POST :id/close, GET :id/submissions
- DTO: create-tender-session, submit-tender-proposal, condition-tender-session
- `tender.service.spec.ts` — unit test có

### ✅ BACK-4: Auction Data Layer
- Entity: `auction-session`, `auction-bid`
- Model Sequelize: đủ 2 model
- Repository: đủ 2 repository

### ✅ BACK-5: Auction Service/API
- `auction.service.ts` — 303 dòng: createSession, publishSession, placeBid, evaluateSession, closeSession, getSessionDetails, getStatus, getBids
- `auction.controller.ts` — endpoints: POST /, POST :id/publish, POST :id/bids, POST :id/evaluate, GET :id, GET :id/status, POST :id/close, GET :id/bids
- DTO: create-auction-session, place-auction-bid, auction-session-status, condition-auction-session
- `auction.service.spec.ts` — unit test có

### ⏳ BACK-6: Cron & Realtime Fallback
- `src/modules/cron-job/cron-job.service.ts` — **CHỈ LÀ STUB** (`console.log` rỗng)
- Cần làm:
  - [ ] Cron tự động open session khi đến `thoiGianBatDau`
  - [ ] Cron tự động close session khi đến `thoiGianKetThuc`
  - [ ] Endpoint status/ranking tối ưu cho polling (đã có GET :id/status và GET :id/ranking)
  - [ ] WebSocket/SSE (optional nếu có thời gian)

### ❌ BACK-7: Audit & Hardening
- Chưa có `audit-log` module
- Cần làm:
  - [ ] Tạo audit-log module (entity, model, repo, service)
  - [ ] Hook `createAuditLog()` vào các action quan trọng (bid, submit, publish, close)
  - [ ] Rate limit endpoint bid/submit
  - [ ] Permission check Host/Admin/Bidder
  - [ ] Ẩn danh participant theo `isAnonymous`

---

## Vấn đề kỹ thuật cần lưu ý

- **Node v14** đang dùng không tương thích ts-jest mới → test chưa chạy được. Cần nâng Node lên v18+ hoặc downgrade ts-jest.
- Chưa có `audit-log` module dù plan đề cập hook `createAuditLog()` nên các service hiện tại chưa có hook này.

---

## Cách cập nhật file này

Sau mỗi task/phase hoàn thành, AI worker cập nhật:
1. Đổi trạng thái trong bảng tổng quan (❌ → ⏳ → ✅)
2. Cập nhật chi tiết phase tương ứng (tick checkbox, ghi chú file đã tạo)
3. Cập nhật dòng "Đang ở:" để chỉ phase tiếp theo

_Last updated: 2026-05-29_
