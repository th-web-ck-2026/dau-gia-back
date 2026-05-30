# CLAUDE.md — dau-gia-back

## Quy tắc bắt buộc cho mọi AI worker

1. **Đọc `STATE.md` trước** khi bắt đầu bất kỳ task nào liên quan đến plan.
2. **Đọc `docs/back/PLAN.md`** để hiểu spec đầy đủ của phase đang làm.
3. **Cập nhật `STATE.md`** ngay sau khi hoàn thành một phase hoặc task con.
4. Không tự ý sửa code nếu chưa hỏi user.
5. Giữ đúng pattern của repo: `controllers / services / repositories / entities / models / dto`, dùng BaseRepository/BaseService.
6. Không đặt business logic trong controller — scoring/validation phải ở service.

## Stack

NestJS 11, Sequelize, PostgreSQL, class-validator, @nestjs/swagger, JWT auth/role guard.

## Workflow khi nhận task

```
1. Đọc STATE.md → xác định phase hiện tại
2. Đọc PLAN.md section tương ứng → hiểu spec
3. Hỏi user nếu có điểm mơ hồ
4. Implement → test → cập nhật STATE.md
```
