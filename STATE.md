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
| BACK-6 | Cron & Realtime Fallback | ✅ DONE |
| BACK-7 | Audit & Hardening | ✅ DONE |
| BACK-8 | Unique Participant Count | ✅ DONE |
| BACK-9 | Module Review & Hardening | ✅ DONE |

**Đang ở:** Backend phases + đợt rà soát hardening đã xong. Sẵn sàng cho frontend integration.

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

### ✅ BACK-6: Cron & Realtime Fallback
- `src/modules/cron-job/cron-job.service.ts` — Đã hoàn thành triển khai background Cron job và realtime fallback check.
- Cần làm:
  - [x] 1. Cron tự động open session khi đến `thoiGianBatDau`
  - [x] 2. Cron tự động close session khi đến `thoiGianKetThuc`
  - [x] 3. Endpoint status/ranking tối ưu cho polling (đã có GET :id/status và GET :id/ranking)
  - [x] 4. WebSocket/SSE (optional nếu có thời gian)

### ✅ BACK-7: Audit & Hardening
- `src/modules/audit-log` — Đã hoàn thành triển khai AuditLog module và tích hợp hooks.
- Cần làm:
  - [x] Tạo audit-log module (entity, model, repo, service)
  - [x] Hook `createAuditLog()` vào các action quan trọng (bid, submit, publish, close)
  - [x] Rate limit endpoint bid/submit
  - [x] Permission check Host/Admin/Bidder
  - [x] Ẩn danh participant theo `isAnonymous` / `anDanh`

### ✅ BACK-8: Unique Participant Count
- [x] Thêm `soLuongNguoiThamGia` cho đấu giá (model, entity, status DTO, placeBid logic, onModuleInit self-healing)
- [x] Thêm `soLuongNguoiThamGia` cho đấu thầu (model, entity, submitProposal logic, onModuleInit self-healing)

### ✅ BACK-9: Module Review & Hardening (commit `bf25001`)
Báo cáo: `docs/html-tailwind/module-review-report.html`

**P0 - Critical:**
- [x] `main.ts` — CORS đọc từ env `CORS_ORIGIN` (multi-origin, thay vì hardcode `*`)
- [x] `app.module.ts` — bật `AuthGuard` global (trước đây bị comment-out → mọi endpoint public)
- [x] `auth.controller.ts` — bỏ `@Public()` ở class scope, áp per-method; logout-all/change-password được protect đúng
- [x] `auth.service.ts` — `register` không spread password vào user table; `resetPassword` update credential qua `AuthProviderService.updateCredentials` (trước đó update sai bảng → reset không có hiệu lực)
- [x] `auction.service.ts::placeBid` — bọc `sequelize.transaction` + `LOCK.UPDATE` chống race condition; throw `ConflictException(409)` với `{giaCaoNhat, giaToiThieuKeTiep}`
- [x] `auction-bid.model/entity` — tie-break theo `thoiDiemDat` ASC (đã bỏ field `thuTuServer` autoIncrement vì Sequelize sync alter không hỗ trợ chuyển INTEGER → SERIAL trên Postgres, gây boot fail `type "serial" does not exist`). Cần chạy thủ công: `ALTER TABLE "gia_dau_gia" DROP COLUMN IF EXISTS "thuTuServer";` để dọn cột rác trên DB hiện hữu.

**P1 - Integration:**
- [x] Notification hooks: `AUCTION_OUTBID/AUCTION_WON/AUCTION_CLOSED`, `TENDER_NEW_SUBMISSION/TENDER_WON/TENDER_CLOSED`
- [x] `auction/tender/cron-job.module` — import `NotificationModule`
- [x] `tender.controller` — route `POST /tenders/:id/submissions` (thay `/submissions`); DTO `phienId` optional
- [x] `audit-log` — `nguoiThucHienId` nullable cho system-triggered events
- [x] `auction/tender.service::evaluateSession` — signature nhận `userId: string | null` (system trigger)

**P2-P3 - Minor:**
- [x] `mail-config.module` — bỏ import `SequelizeModule.forFeature` trùng

**Tests & Verify:**
- [x] `auction/tender service spec` — mock `NotificationService` + `Sequelize.transaction`
- [x] 3 controller spec — dùng `objectContaining` cho assertion `getPage`
- [x] `tender.controller.spec` — cập nhật `submitProposal` test theo route mới
- [x] Build pass, **83/83 unit tests pass**

---

## Vấn đề kỹ thuật cần lưu ý

- **Node v14** đang dùng không tương thích ts-jest mới → đã verify chạy được trên môi trường hiện tại (83/83 pass). Nếu CI dùng Node v14 cần check lại.
- ~~Chưa có `audit-log` module~~ → đã có (BACK-7) và đã hook vào các action quan trọng.
- `.claude/` (worktrees, plans, settings nội bộ) chưa nằm trong `.gitignore` → nên thêm để sạch `git status`.

---

## Cách cập nhật file này

Sau mỗi task/phase hoàn thành, AI worker cập nhật:
1. Đổi trạng thái trong bảng tổng quan (❌ → ⏳ → ✅)
2. Cập nhật chi tiết phase tương ứng (tick checkbox, ghi chú file đã tạo)
3. Cập nhật dòng "Đang ở:" để chỉ phase tiếp theo

_Last updated: 2026-06-01 (revert `thuTuServer` autoIncrement → tie-break by `thoiDiemDat`)_
