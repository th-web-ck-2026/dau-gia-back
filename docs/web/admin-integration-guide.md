# Hướng Dẫn Tích Hợp Web - Quản Trị Admin (Statistics & User Management)

Tài liệu này hướng dẫn cách tích hợp các API Admin mới trên ứng dụng Web (Frontend), bao gồm thống kê hệ thống (Stats Dashboard), phân trang người dùng (User Management Table) và chỉnh sửa thông tin người dùng.

---

## 🔐 1. Xác thực và Phân quyền (Authentication & Authorization)

Tất cả các API dưới đây đều yêu cầu quyền truy cập của quản trị viên hệ thống (**ADMIN**).
- **Header bắt buộc**: `Authorization: Bearer <JWT_TOKEN>`
- **Token giải mã**: Phải có vai trò `role: "ADMIN"`. Nếu không có quyền, hệ thống sẽ trả về lỗi `403 Forbidden` hoặc `401 Unauthorized`.

---

## 📊 2. API Thống kê Dashboard (`GET /thong-ke/admin/stats`)

Dùng để vẽ các biểu đồ, thẻ thông số (Summary Cards) trên trang chủ quản trị.

### 📡 Request
- **Method**: `GET`
- **URL**: `/thong-ke/admin/stats`

### 📥 Response (Ví dụ)
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 120,
      "active": 115,
      "blocked": 5,
      "verified": 95,
      "unverified": 25,
      "byRole": {
        "ADMIN": 3,
        "USER": 117
      },
      "byType": {
        "TO_CHUC": 40,
        "CA_NHAN": 80
      }
    },
    "auctions": {
      "total": 45,
      "draft": 5,
      "published": 10,
      "open": 8,
      "closed": 20,
      "cancelled": 2,
      "successful": 15,
      "totalWinningValue": 2550000000,
      "totalBids": 340
    },
    "tenders": {
      "total": 30,
      "draft": 2,
      "published": 5,
      "open": 6,
      "closed": 15,
      "cancelled": 2,
      "successful": 12,
      "totalSubmissions": 98
    },
    "verifications": {
      "total": 50,
      "pending": 5,
      "approved": 40,
      "rejected": 5
    }
  }
}
```

### 💡 Gợi ý thiết kế Giao diện (UI/UX)
1. **Thẻ Thống kê (Metrics Cards)**:
   - **Người dùng**: Hiển thị Tổng số người dùng, tỷ lệ hoạt động/khóa (`115 Active / 5 Blocked`) và tỷ lệ đã xác minh danh tính.
   - **Đấu giá**: Hiển thị Tổng số phiên, số phiên đang Mở, số phiên thành công, và tổng giá trị giao dịch thành công (`2.55B VNĐ`).
   - **Đấu thầu**: Hiển thị Tổng số phiên đấu thầu, số lượt nộp hồ sơ.
2. **Biểu đồ (Charts)**:
   - Dùng **Doughnut/Pie Chart** để hiển thị tỷ lệ Cá nhân vs Tổ chức (`byType`), và trạng thái yêu cầu xác minh.
   - Dùng **Bar Chart** so sánh số lượng phiên đấu giá vs đấu thầu theo các trạng thái (`draft`, `open`, `closed`).

---

## 👥 3. API Danh sách Người dùng (`GET /user/admin/page`)

Dùng để hiển thị bảng quản lý người dùng với đầy đủ chức năng tìm kiếm, phân trang và bộ lọc.

### 📡 Request
- **Method**: `GET`
- **URL**: `/user/admin/page`
- **Query Parameters**:
  - `page`: Số trang (mặc định: `1`).
  - `limit`: Số lượng bản ghi trên một trang (mặc định: `10`).
  - `condition`: Dùng để lọc chính xác dữ liệu (dạng JSON string).
    - Các trường hỗ trợ lọc: `role` (`ADMIN`/`USER`), `userStatus` (`ACTIVE`/`BLOCKED`), `userRoles` (`TO_CHUC`/`CA_NHAN`), `isVerified` (`true`/`false`).

#### Ví dụ URL gửi từ Web:
```http
# Lấy trang 1, tối đa 10 người dùng, chỉ lấy vai trò USER đang hoạt động (ACTIVE)
GET /user/admin/page?page=1&limit=10&condition={"role":"USER","userStatus":"ACTIVE"}
```

### 📥 Response (Ví dụ)
```json
{
  "success": true,
  "data": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 117
    },
    "rows": [
      {
        "_id": "603d2b2f8c92a210dcb8a391",
        "fullname": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0987654321",
        "role": "USER",
        "userRoles": "CA_NHAN",
        "userStatus": "ACTIVE",
        "isVerified": true,
        "createdAt": "2026-06-01T08:00:00.000Z"
      }
    ]
  }
}
```

### 💡 Gợi ý thiết kế Giao diện (UI/UX)
- **Bộ lọc (Filter Bar)**: Thiết kế các Dropdown để admin lọc nhanh theo:
  - Vai trò: `Tất cả` / `Admin` / `Người dùng`
  - Trạng thái: `Tất cả` / `Đang hoạt động` / `Đang bị khóa`
  - Loại tài khoản: `Tất cả` / `Cá nhân` / `Tổ chức`
  - Trạng thái xác minh: `Tất cả` / `Đã xác minh` / `Chưa xác minh`
- **Ô tìm kiếm**: Hỗ trợ tìm kiếm theo Họ tên, Email, Số điện thoại (sử dụng query parameter `condition` với toán tử `$like` hoặc `$ilike` nếu backend hỗ trợ, hoặc thực hiện tìm kiếm chính xác).

---

## ✏️ 4. API Chỉnh sửa Người dùng (`PUT /user/admin/:id`)

Dùng khi Admin muốn sửa đổi vai trò, khóa tài khoản, hoặc cập nhật thông tin cá nhân của một người dùng bất kỳ.

### 📡 Request
- **Method**: `PUT`
- **URL**: `/user/admin/:id`
- **Body (JSON)**: Truyền lên các trường cần cập nhật (tất cả đều là optional):
  ```json
  {
    "fullname": "Nguyễn Văn B",
    "role": "USER",
    "userStatus": "BLOCKED",
    "isVerified": false
  }
  ```

### 📥 Response (Ví dụ thành công)
```json
{
  "success": true,
  "data": {
    "_id": "603d2b2f8c92a210dcb8a391",
    "fullname": "Nguyễn Văn B",
    "email": "nguyenvana@example.com",
    "phone": "0987654321",
    "role": "USER",
    "userRoles": "CA_NHAN",
    "userStatus": "BLOCKED",
    "isVerified": false,
    "updatedAt": "2026-06-07T08:33:00.000Z"
  }
}
```

### ❌ Lỗi thường gặp (Error Codes)
- **409 Conflict**: Trả về khi Admin cập nhật Số điện thoại hoặc Email bị trùng với tài khoản khác đã tồn tại.
  ```json
  {
    "statusCode": 409,
    "message": "Số điện thoại đã tồn tại"
  }
  ```
- **404 Not Found**: Trả về khi `id` người dùng không tồn tại.

### 💡 Gợi ý thiết kế Giao diện (UI/UX)
- Sử dụng **Modal Popup** hoặc **Drawer bên phải** khi Admin bấm nút "Sửa" ở hàng người dùng.
- Hiển thị Switch toggle hoặc Dropdown cho `userStatus` (Kích hoạt / Khóa) và `isVerified` (Đã xác minh / Chưa xác minh).
- Hiển thị thông báo Toast đẹp mắt khi cập nhật thành công hoặc khi xảy ra lỗi trùng lặp dữ liệu (409).
