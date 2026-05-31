# Plan: Fix Toàn Bộ Vấn Đề Backend dau-gia-back

## Tổng quan

Workflow multi-agent sẽ fix **15 issues** (3 P0, 5 P1, 4 P2, 3 P3) song song theo 4 phase.

---

## Phase 1: P0 Critical Fixes (3 agents song song)

### Agent 1A: Fix `placeBid` race condition
**File:** `src/modules/auction/services/auction.service.ts`
- Inject `Sequelize` instance vào `AuctionService`
- Bọc toàn bộ logic `placeBid` (line 152-214) trong `sequelize.transaction`
- Dùng `lock: Transaction.LOCK.UPDATE` khi đọc session
- Thêm field `thuTuServer` (auto-increment) vào:
  - `src/modules/auction/entities/auction-bid.entity.ts`
  - `src/modules/auction/models/auction-bid.model.ts`
- Đổi `BadRequest` → `ConflictException` (409) khi giá bị vượt, trả kèm `giaCaoNhat` + `giaToiThieuKeTiep`
- Update `auction.module.ts` import `SequelizeModule`

### Agent 1B: Fix Auth Controller `@Public()` + resetPassword
**File:** `src/modules/auth/controllers/auth.controller.ts`
- Bỏ `@Public()` ở class scope (line 12)
- Thêm `@Public()` cho từng endpoint cần public: `register`, `login`, `refresh`, `forgot-password`, `reset-password/token`, `logout`
- Thêm `@Auth()` cho `logout-all`, `change-password`
- Import `Auth` decorator

**File:** `src/modules/auth/services/auth.service.ts`
- Sửa `resetPassword` (line 271-284): thay `userRepository.updateOne({password})` bằng `authProviderService.updateCredentials(userId, AuthProvider.EMAIL, newPassword)`
- Sửa `register` (line 172-186): bỏ spread `...registerDto` (chứa password) khi tạo user, chỉ truyền fields cần thiết (email, fullname, phone, soCccd, role, userRoles, avatar, diaChi)
- Xóa route trùng `reset-password/password` (controller)

### Agent 1C: Fix CORS + Bật AuthGuard global
**File:** `src/main.ts`
- Đổi CORS config: `origin` từ `'*'` thành env `CORS_ORIGIN` hoặc array whitelist, bỏ `credentials: true` nếu dùng `*`

**File:** `src/app.module.ts`
- Uncomment `APP_GUARD` AuthGuard (line 68-71)

---

## Phase 2: P1 Integration Fixes (3 agents song song)

### Agent 2A: Hook NotificationService vào Tender + Auction
**File:** `src/modules/tender/tender.module.ts`
- Import `NotificationModule`

**File:** `src/modules/tender/services/tender.service.ts`
- Inject `NotificationService`
- Hook `createNotification` tại:
  - `submitProposal` → noti cho host "Có đề xuất mới"
  - `closeSession` → noti cho winner "Bạn đã thắng" + losers "Phiên đã đóng"

**File:** `src/modules/auction/auction.module.ts`
- Import `NotificationModule`

**File:** `src/modules/auction/services/auction.service.ts`
- Inject `NotificationService`
- Hook `createNotification` tại:
  - `placeBid` → noti cho leading-cũ "Bạn đã bị vượt giá"
  - `closeSession` → noti cho winner + losers

### Agent 2B: Fix Tender submit route
**File:** `src/modules/tender/controllers/tender.controller.ts`
- Đổi `@Post('submissions')` → `@Post(':id/submissions')`
- Thêm `@Param('id') id: string` vào method
- Set `dto.phienId = id` trong controller (giống auction pattern)

### Agent 2C: Fix nguoiThucHienId='SYSTEM' → null
**File:** `src/modules/tender/services/tender.service.ts`
- Trong `checkAndTransitionStateInternal`: đổi `evaluateSession('SYSTEM', ...)` → `evaluateSession(null, ...)`

**File:** `src/modules/auction/services/auction.service.ts`
- Trong `checkAndTransitionStateInternal`: đổi `evaluateSession('SYSTEM', ...)` → `evaluateSession(null, ...)`

**File:** `src/modules/tender/services/tender.service.ts` + `src/modules/auction/services/auction.service.ts`
- Sửa `evaluateSession` signature: `userId: string` → `userId: string | null`
- Sửa `auditLogService.logAction(userId, ...)` → `auditLogService.logAction(userId || null, ...)`

---

## Phase 3: P2 + P3 Minor Fixes (1 agent)

### Agent 3A: Batch minor fixes
- `src/modules/mail-config/mail-config.module.ts`: Bỏ `SequelizeModule.forFeature([MailConfigModel])` dư thừa
- `src/modules/auction/entities/auction-bid.entity.ts`: Thêm field `thuTuServer?: number` (đã handle ở Phase 1)
- `src/modules/cron-job/cron-job.module.ts`: Thêm `NotificationModule` import (để cron có thể noti khi close)

---

## Phase 4: Verify Build (1 agent)

### Agent 4A: Build verification
- Chạy `npx nest build` để verify không có compile error
- Chạy `npx jest --passWithNoTests` nếu có test
- Report kết quả

---

## Tóm tắt agents

| Phase | Agents | Song song | Mô tả |
|-------|--------|-----------|--------|
| 1 | 3 | ✅ | P0 fixes (race condition, auth, CORS) |
| 2 | 3 | ✅ | P1 fixes (notification, route, system userId) |
| 3 | 1 | - | P2+P3 batch minor |
| 4 | 1 | - | Build verify |

**Tổng: 8 agents**, ước tính ~150-200k tokens.
