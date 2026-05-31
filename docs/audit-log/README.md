# Audit Logging System Documentation

This document describes the design and usage of the Audit Logging system implemented in the application to record critical actions for compliance, audit, and security purposes.

---

## 1. Overview
The `AuditLogModule` is a globally registered module that provides service hooks to record important user-driven operations in the database (e.g., publishing a session, placing bids, submitting proposals, or closing/evaluating sessions).

---

## 2. Database Schema (`nhat_ky_kiem_toan`)

The audit logs are persisted in the `nhat_ky_kiem_toan` table. The data structure is defined as follows:

| Field Name | Type | Description |
|---|---|---|
| `_id` | `VARCHAR` (Primary Key) | Auto-generated UUID string without hyphens. |
| `nguoiThucHienId` | `VARCHAR` (Nullable) | The ID of the authenticated user performing the action. Set to `'SYSTEM'` for automated tasks. |
| `hanhDong` | `VARCHAR` | The action type identifier (e.g., `PUBLISH_AUCTION_SESSION`). |
| `loaiDoiTuong` | `VARCHAR` | The model/entity class being acted upon (e.g., `AuctionSession`, `TenderSubmission`). |
| `doiTuongId` | `VARCHAR` | The unique ID of the object being acted upon. |
| `truocKhi` | `JSONB` (Nullable) | The state of the object *before* the action was executed. |
| `sauKhi` | `JSONB` (Nullable) | The state of the object *after* the action was executed. |
| `duLieuBoSung` | `JSONB` (Nullable) | Any extra metadata or audit details. |
| `createdAt` | `TIMESTAMP` | Record creation timestamp. |
| `updatedAt` | `TIMESTAMP` | Record modification timestamp. |

---

## 3. Registered Audit Action Types

The following action types are currently hooked and logged within the Tender and Auction modules:

### 3.1. Tender Sessions
- **`CREATE_TENDER_SESSION`**: Triggered when a new tender session draft is created.
- **`PUBLISH_TENDER_SESSION`**: Triggered when a host publishes a tender session. Saves the state transition from `NHAP` to `CONG_BO`/`MO`.
- **`SUBMIT_TENDER_PROPOSAL`**: Triggered when a bidder submits a proposal. Logs the generated proposal details.
- **`EVALUATE_TENDER_SESSION`**: Triggered during manual or cron-based session evaluation.
- **`CLOSE_TENDER_SESSION`**: Triggered when a session is closed (manually or automatically via cron). Logs the state transition to `DONG`.

### 3.2. Auction Sessions
- **`CREATE_AUCTION_SESSION`**: Triggered when a new auction session draft is created.
- **`PUBLISH_AUCTION_SESSION`**: Triggered when a host publishes an auction session. Saves the state transition.
- **`PLACE_AUCTION_BID`**: Triggered when a bidder successfully places a bid. Logs the bid details (amount, participant ID).
- **`EVALUATE_AUCTION_SESSION`**: Triggered during evaluation.
- **`CLOSE_AUCTION_SESSION`**: Triggered when the auction session is closed.

---

## 4. Admin API Endpoint

An endpoint is exposed to query and monitor audit logs:

- **Endpoint**: `GET /audit-logs`
- **Authentication**: Required (`@Auth(UserRoles.ADMIN)`)
- **Access Level**: Admin Only
- **Response**: Paginated list of audit logs (supports query filters, limit, offset, and sorting).

---

## 5. How to Log New Actions

Since `AuditLogModule` is marked as `@Global()`, you can inject `AuditLogService` into any provider/service across the project:

### Step 1: Inject the Service
Inject `AuditLogService` via the constructor of your service:

```typescript
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';

constructor(
  private readonly auditLogService: AuditLogService,
) {}
```

### Step 2: Log the Action
Invoke `auditLogService.logAction()` at the end of the business flow:

```typescript
await this.auditLogService.logAction(
  userId,                          // Actor ID (string | undefined)
  'MY_CUSTOM_ACTION',              // Action Name (string)
  'MyEntity',                      // Object Type (string)
  entityId,                        // Object ID (string)
  beforeState,                     // Pre-state payload (any | null)
  afterState,                      // Post-state payload (any | null)
  extraData                        // Supplemental information (any | null)
);
```
