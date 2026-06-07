# Module `giao-dich` (luồng hậu đấu giá / đấu thầu) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm module `giao-dich` xử lý toàn bộ luồng sau khi có người thắng: xác nhận (48h) → thanh toán (đấu giá) / ký hợp đồng + bàn giao (đấu thầu) → hoàn tất, kèm lộ thông tin liên hệ 2 bên.

**Architecture:** Một module dùng chung cho cả 2 loại phiên (rẽ nhánh theo `loaiPhien`). `evaluateSession` của auction/tender gọi `GiaoDichService.taoTuPhien(...)` để tạo bản ghi giao dịch (one-way DI, tránh circular). State machine + guard vai trò/trạng thái nằm trong service. Cron quét quá hạn 48h. Thông tin liên hệ + thông tin chuyển khoản đọc realtime từ `user` (không snapshot).

**Tech Stack:** NestJS 11, Sequelize (sequelize-typescript), class-validator, @nestjs/swagger, Jest. Theo pattern `BaseService`/`BaseRepository` + module `bao-cao-user` làm khuôn.

**Spec gốc:** `docs/superpowers/specs/2026-06-07-giao-dich-hau-ky-design.md`

---

## Điều chỉnh so với spec (đã xác minh code)

1. **Thông tin chuyển khoản** lấy realtime từ `user` chủ phiên (`tenNganHang`, `soTaiKhoan`, `tenTaiKhoan`) — `user.entity.ts:82-93` đã có sẵn. KHÔNG snapshot vào entity `giao_dich` (bỏ field `thongTinChuyenKhoan`). Đơn giản & nhất quán với cách lấy liên hệ.
2. `AuditLogModule` và `NotificationModule` đều `@Global()` → service chỉ cần inject, không cần import module.
3. Liên hệ lấy từ `user`: `fullname, email, phone, diaChi` (`user.entity.ts`).

## File Structure

```
src/modules/giao-dich/
├── giao-dich.module.ts                          (Create)
├── common/constants.ts                          (Create) — enum TrangThaiGiaoDich, LyDoThatBai
├── entities/giao-dich.entity.ts                 (Create)
├── models/giao-dich.model.ts                    (Create)
├── repositories/giao-dich.repository.ts         (Create)
├── dto/condition-giao-dich.dto.ts               (Create)
├── dto/da-chuyen-khoan.dto.ts                   (Create)
├── dto/ghi-chu.dto.ts                           (Create)
├── services/giao-dich.service.ts                (Create)
├── services/giao-dich.service.spec.ts           (Create)
├── controllers/giao-dich.controller.ts          (Create)
└── controllers/giao-dich.controller.spec.ts     (Create)

Sửa tích hợp:
├── src/common/constants/entity.constant.ts                      (Modify) — thêm GIAO_DICH
├── src/modules/repository/common/sequelize-model.ts             (Modify) — thêm GiaoDichModel
├── src/app.module.ts                                            (Modify) — import GiaoDichModule
├── src/modules/auction/auction.module.ts                        (Modify) — import GiaoDichModule
├── src/modules/auction/services/auction.service.ts:385-411      (Modify) — gọi taoTuPhien
├── src/modules/tender/tender.module.ts                          (Modify) — import GiaoDichModule
├── src/modules/tender/services/tender.service.ts:442-464        (Modify) — gọi taoTuPhien
└── src/modules/cron-job/cron-job.service.ts                     (Modify) — cron quá hạn 48h
```

---

Plan này được chia thành các **Task** nhỏ. Mỗi task tự chứa code đầy đủ. Dưới đây là Task 1 (nền tảng: enum + entity + model + repository). Các task tiếp theo (service, controller, tích hợp, cron) sẽ được bổ sung ngay sau khi bạn duyệt cấu trúc.

## Task 1: Nền tảng dữ liệu — enum, entity, model, repository

**Files:**
- Create: `src/modules/giao-dich/common/constants.ts`
- Create: `src/modules/giao-dich/entities/giao-dich.entity.ts`
- Create: `src/modules/giao-dich/models/giao-dich.model.ts`
- Create: `src/modules/giao-dich/repositories/giao-dich.repository.ts`
- Modify: `src/common/constants/entity.constant.ts`
- Modify: `src/modules/repository/common/sequelize-model.ts`

- [ ] **Step 1: Tạo enum constants**

Create `src/modules/giao-dich/common/constants.ts`:

```typescript
export enum TrangThaiGiaoDich {
  CHO_XAC_NHAN = 'CHO_XAC_NHAN',
  DA_XAC_NHAN = 'DA_XAC_NHAN',
  CHO_THANH_TOAN = 'CHO_THANH_TOAN',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
  CHO_KY_HOP_DONG = 'CHO_KY_HOP_DONG',
  DA_KY_HOP_DONG = 'DA_KY_HOP_DONG',
  DANG_BAN_GIAO = 'DANG_BAN_GIAO',
  HOAN_TAT = 'HOAN_TAT',
  THAT_BAI = 'THAT_BAI',
  DA_HUY = 'DA_HUY',
}

export enum LyDoThatBai {
  TU_CHOI = 'TU_CHOI',
  QUA_HAN = 'QUA_HAN',
}

export const HAN_XAC_NHAN_GIO = 48;
```

- [ ] **Step 2: Thêm bảng vào EntityTable**

Modify `src/common/constants/entity.constant.ts` — thêm dòng cuối trước `} as const;`:

```typescript
  BAO_CAO_USER: 'bao_cao_users',
  GIAO_DICH: 'giao_dich',
} as const;
```

- [ ] **Step 3: Tạo entity**

Create `src/modules/giao-dich/entities/giao-dich.entity.ts`:

```typescript
import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@Common/constants/base.constant';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

export class GiaoDich implements BaseEntity {
  @StrObjectId()
  _id: string;

  phienId: string;
  loaiPhien: LoaiPhien;
  chuPhienId: string;
  nguoiThangId: string;
  trangThai: TrangThaiGiaoDich;

  giaChot?: number;
  hanXacNhan: Date;
  thoiDiemXacNhan?: Date;
  lyDoThatBai?: string;

  // Thanh toán (đấu giá)
  anhChungTu?: string[];
  thoiDiemNguoiThangBaoDaCK?: Date;
  thoiDiemChuPhienXacNhanTien?: Date;

  // Hợp đồng (đấu thầu)
  chuPhienDaKy?: boolean;
  nguoiThangDaKy?: boolean;

  // Bàn giao (đấu thầu)
  daBanGiao?: boolean;
  nguoiThangXacNhanNhan?: boolean;

  // Liên hệ (chung)
  ghiChuLienHeChuPhien?: string;
  ghiChuLienHeNguoiThang?: string;

  thoiDiemHoanTat?: Date;
}
```

- [ ] **Step 4: Tạo model**

Create `src/modules/giao-dich/models/giao-dich.model.ts`:

```typescript
import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { GiaoDich } from '../entities/giao-dich.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

@Table({
  tableName: EntityTable.GIAO_DICH,
})
export class GiaoDichModel extends Model implements GiaoDich {
  @StrObjectId()
  _id: string;

  @Column({ allowNull: false })
  phienId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LoaiPhien)),
    allowNull: false,
  })
  loaiPhien: LoaiPhien;

  @Column({ allowNull: false })
  chuPhienId: string;

  @Column({ allowNull: false })
  nguoiThangId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiGiaoDich)),
    defaultValue: TrangThaiGiaoDich.CHO_XAC_NHAN,
  })
  trangThai: TrangThaiGiaoDich;

  @Column({ type: DataType.FLOAT, allowNull: true })
  giaChot: number;

  @Column({ allowNull: false })
  hanXacNhan: Date;

  @Column({ allowNull: true })
  thoiDiemXacNhan: Date;

  @Column({ allowNull: true })
  lyDoThatBai: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  anhChungTu: string[];

  @Column({ allowNull: true })
  thoiDiemNguoiThangBaoDaCK: Date;

  @Column({ allowNull: true })
  thoiDiemChuPhienXacNhanTien: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  chuPhienDaKy: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  nguoiThangDaKy: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  daBanGiao: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  nguoiThangXacNhanNhan: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  ghiChuLienHeChuPhien: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  ghiChuLienHeNguoiThang: string;

  @Column({ allowNull: true })
  thoiDiemHoanTat: Date;
}
```

- [ ] **Step 5: Tạo repository**

Create `src/modules/giao-dich/repositories/giao-dich.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { GiaoDich } from '../entities/giao-dich.entity';
import { GiaoDichModel } from '../models/giao-dich.model';

@Injectable()
export class GiaoDichRepository extends BaseRepository<GiaoDich> {
  constructor() {
    super(GiaoDichModel);
  }
}
```

- [ ] **Step 6: Đăng ký model vào SequelizeModel**

Modify `src/modules/repository/common/sequelize-model.ts`:
- Thêm import sau dòng 18: `import { GiaoDichModel } from '@/modules/giao-dich/models/giao-dich.model';`
- Thêm `GiaoDichModel,` vào cuối mảng `SequelizeModel` (sau `BaoCaoUserModel,`).

- [ ] **Step 7: Build kiểm tra biên dịch**

Run: `npm run build`
Expected: PASS (không lỗi TypeScript). Model/entity mới biên dịch sạch.

- [ ] **Step 8: Commit**

```bash
git add src/modules/giao-dich/common src/modules/giao-dich/entities src/modules/giao-dich/models src/modules/giao-dich/repositories src/common/constants/entity.constant.ts src/modules/repository/common/sequelize-model.ts
git commit -m "feat(giao-dich): data layer — enum, entity, model, repository"
```

---

## Task 2: DTO

**Files:**
- Create: `src/modules/giao-dich/dto/condition-giao-dich.dto.ts`
- Create: `src/modules/giao-dich/dto/da-chuyen-khoan.dto.ts`
- Create: `src/modules/giao-dich/dto/ghi-chu.dto.ts`

- [ ] **Step 1: condition DTO (filter cho /me)**

Create `src/modules/giao-dich/dto/condition-giao-dich.dto.ts`:

```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

export class ConditionGiaoDichDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsEnum(LoaiPhien)
  @IsOptional()
  loaiPhien?: LoaiPhien;

  @IsEnum(TrangThaiGiaoDich)
  @IsOptional()
  trangThai?: TrangThaiGiaoDich;
}
```

- [ ] **Step 2: da-chuyen-khoan DTO**

Create `src/modules/giao-dich/dto/da-chuyen-khoan.dto.ts`:

```typescript
import { IsArray, IsOptional, IsString } from 'class-validator';

export class DaChuyenKhoanDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  anhChungTu?: string[];
}
```

- [ ] **Step 3: ghi-chu DTO**

Create `src/modules/giao-dich/dto/ghi-chu.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class GhiChuDto {
  @IsString()
  @IsNotEmpty()
  ghiChu: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/giao-dich/dto
git commit -m "feat(giao-dich): DTO condition, da-chuyen-khoan, ghi-chu"
```

---

## Task 3: GiaoDichService — taoTuPhien + state machine

**Files:**
- Create: `src/modules/giao-dich/services/giao-dich.service.ts`
- Create: `src/modules/giao-dich/services/giao-dich.service.spec.ts`

Service inject: `GiaoDichRepository`, `UsersService` (lộ liên hệ + thông tin CK), `NotificationService` (@Global), `AuditLogService` (@Global).

> **Lưu ý guard chung:** mọi action lấy giao dịch bằng `getById`; null → `ApiError.NotFound`. Kiểm tra vai (`chuPhienId`/`nguoiThangId`) và trạng thái nguồn trước khi đổi. Sai vai → `ApiError.Forbidden`. Sai trạng thái → `ApiError.BadRequest`.

- [ ] **Step 1: Viết test thất bại cho `taoTuPhien`**

Create `src/modules/giao-dich/services/giao-dich.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GiaoDichService } from './giao-dich.service';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';
import { ApiError } from '@/common/exceptions/api-error';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich, LyDoThatBai } from '../common/constants';

describe('GiaoDichService', () => {
  let service: GiaoDichService;
  let repo: any;

  const mockRepo = {
    create: jest.fn(),
    getById: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getPage: jest.fn(),
    updateOne: jest.fn(),
  };
  const mockUsersService = { getOne: jest.fn() };
  const mockNotificationService = { createNotification: jest.fn().mockResolvedValue({}) };
  const mockAuditLogService = { logAction: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiaoDichService,
        { provide: GiaoDichRepository, useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<GiaoDichService>(GiaoDichService);
    repo = module.get<GiaoDichRepository>(GiaoDichRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('taoTuPhien', () => {
    it('tạo giao dịch mới với trạng thái CHO_XAC_NHAN và hạn 48h', async () => {
      repo.getOne.mockResolvedValue(null); // chưa có giao dịch cho phiên
      repo.create.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.taoTuPhien({
        phienId: 'p1',
        loaiPhien: LoaiPhien.DAU_GIA,
        chuPhienId: 'host1',
        nguoiThangId: 'winner1',
        giaChot: 500,
      });

      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_XAC_NHAN);
      expect(res.hanXacNhan).toBeInstanceOf(Date);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phienId: 'p1', nguoiThangId: 'winner1', giaChot: 500 }),
      );
    });

    it('idempotent: đã có giao dịch cho phiên thì trả về cái cũ, không tạo mới', async () => {
      repo.getOne.mockResolvedValue({ _id: 'gd1', phienId: 'p1' });
      const res = await service.taoTuPhien({
        phienId: 'p1',
        loaiPhien: LoaiPhien.DAU_GIA,
        chuPhienId: 'host1',
        nguoiThangId: 'winner1',
      });
      expect(res._id).toBe('gd1');
      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t taoTuPhien`
Expected: FAIL — "Cannot find module './giao-dich.service'".

- [ ] **Step 3: Viết service tối thiểu cho `taoTuPhien`**

Create `src/modules/giao-dich/services/giao-dich.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ApiError } from '@Exceptions/api-error';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { PageableDto } from '@/common/dto/pageable.dto';
import { GiaoDich } from '../entities/giao-dich.entity';
import { GiaoDichRepository } from '../repositories/giao-dich.repository';
import { ConditionGiaoDichDto } from '../dto/condition-giao-dich.dto';
import { DaChuyenKhoanDto } from '../dto/da-chuyen-khoan.dto';
import { GhiChuDto } from '../dto/ghi-chu.dto';
import { TrangThaiGiaoDich, LyDoThatBai, HAN_XAC_NHAN_GIO } from '../common/constants';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service';

interface TaoTuPhienInput {
  phienId: string;
  loaiPhien: LoaiPhien;
  chuPhienId: string;
  nguoiThangId: string;
  giaChot?: number;
}

@Injectable()
export class GiaoDichService extends BaseService<GiaoDich> {
  constructor(
    private readonly giaoDichRepository: GiaoDichRepository,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {
    super(giaoDichRepository);
  }

  async taoTuPhien(input: TaoTuPhienInput): Promise<GiaoDich> {
    const existing = await this.giaoDichRepository.getOne({
      where: { phienId: input.phienId },
    });
    if (existing) return existing;

    const hanXacNhan = new Date(Date.now() + HAN_XAC_NHAN_GIO * 60 * 60 * 1000);
    const giaoDich = await this.giaoDichRepository.create({
      phienId: input.phienId,
      loaiPhien: input.loaiPhien,
      chuPhienId: input.chuPhienId,
      nguoiThangId: input.nguoiThangId,
      giaChot: input.giaChot ?? null,
      trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      hanXacNhan,
    });

    await this.guiThongBao(
      [input.nguoiThangId],
      'GIAODICH_CAN_XAC_NHAN',
      'Bạn cần xác nhận giao dịch',
      `Bạn đã thắng một phiên. Vui lòng xác nhận trong vòng ${HAN_XAC_NHAN_GIO} giờ.`,
      giaoDich._id,
    );
    return giaoDich;
  }

  private async guiThongBao(
    userIds: string[],
    type: string,
    title: string,
    content: string,
    giaoDichId: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification({
        userIds,
        type,
        title,
        content,
        metadata: { targetId: giaoDichId, extra: { giaoDichId } },
      } as any);
    } catch (err) {
      // Không chặn flow nếu gửi thông báo lỗi
    }
  }
}
```

- [ ] **Step 4: Run test — verify PASS**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t taoTuPhien`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/modules/giao-dich/services
git commit -m "feat(giao-dich): service taoTuPhien (idempotent + notify)"
```

---

## Task 4: Service — xác nhận / từ chối + lộ liên hệ

**Files:**
- Modify: `src/modules/giao-dich/services/giao-dich.service.ts`
- Modify: `src/modules/giao-dich/services/giao-dich.service.spec.ts`

- [ ] **Step 1: Thêm test xác nhận + từ chối**

Thêm vào `giao-dich.service.spec.ts` (trong `describe('GiaoDichService')`, sau block `taoTuPhien`):

```typescript
  describe('xacNhan', () => {
    it('người thắng xác nhận đấu giá → DA_XAC_NHAN rồi auto CHO_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.xacNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_THANH_TOAN);
    });

    it('người thắng xác nhận đấu thầu → CHO_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_THAU, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.xacNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_KY_HOP_DONG);
    });

    it('không phải người thắng → Forbidden', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      await expect(service.xacNhan('hacker1', 'gd1')).rejects.toThrow(ApiError);
    });

    it('sai trạng thái nguồn → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.HOAN_TAT,
      });
      await expect(service.xacNhan('winner1', 'gd1')).rejects.toThrow(ApiError);
    });
  });

  describe('tuChoi', () => {
    it('người thắng từ chối → THAT_BAI (TU_CHOI)', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.tuChoi('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.THAT_BAI);
      expect(res.lyDoThatBai).toBe(LyDoThatBai.TU_CHOI);
    });
  });
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t "xacNhan|tuChoi"`
Expected: FAIL — "service.xacNhan is not a function".

- [ ] **Step 3: Thêm method `xacNhan`, `tuChoi`, helpers**

Thêm vào class `GiaoDichService` (trước `private async guiThongBao`):

```typescript
  private async layVaKiemTra(id: string): Promise<GiaoDich> {
    const gd = await this.giaoDichRepository.getById(id);
    if (!gd) throw ApiError.NotFound('Giao dịch không tồn tại');
    return gd;
  }

  private kiemTraVai(gd: GiaoDich, userId: string, vai: 'CHU_PHIEN' | 'NGUOI_THANG'): void {
    const ok = vai === 'CHU_PHIEN' ? gd.chuPhienId === userId : gd.nguoiThangId === userId;
    if (!ok) throw ApiError.Forbidden('Bạn không có quyền thực hiện hành động này');
  }

  private kiemTraTrangThai(gd: GiaoDich, nguon: TrangThaiGiaoDich): void {
    if (gd.trangThai !== nguon) {
      throw ApiError.BadRequest(`Hành động không hợp lệ ở trạng thái ${gd.trangThai}`);
    }
  }

  private async capNhat(id: string, values: Partial<GiaoDich>): Promise<GiaoDich> {
    return this.giaoDichRepository.updateOne(values as any, { where: { _id: id } });
  }

  async xacNhan(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_XAC_NHAN);

    const trangThaiKe =
      gd.loaiPhien === LoaiPhien.DAU_GIA
        ? TrangThaiGiaoDich.CHO_THANH_TOAN
        : TrangThaiGiaoDich.CHO_KY_HOP_DONG;

    const updated = await this.capNhat(id, {
      trangThai: trangThaiKe,
      thoiDiemXacNhan: new Date(),
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_XAC_NHAN', 'GiaoDich', id, null, null);

    const type =
      trangThaiKe === TrangThaiGiaoDich.CHO_THANH_TOAN
        ? 'GIAODICH_CAN_THANH_TOAN'
        : 'GIAODICH_CAN_KY_HD';
    await this.guiThongBao(
      [gd.chuPhienId, gd.nguoiThangId],
      type,
      'Giao dịch đã được xác nhận',
      'Người thắng đã xác nhận. Tiến hành bước tiếp theo.',
      id,
    );
    return updated;
  }

  async tuChoi(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_XAC_NHAN);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.THAT_BAI,
      lyDoThatBai: LyDoThatBai.TU_CHOI,
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_TU_CHOI', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId],
      'GIAODICH_THAT_BAI',
      'Người thắng đã từ chối',
      'Người thắng từ chối nhận. Giao dịch thất bại.',
      id,
    );
    return updated;
  }
```

- [ ] **Step 4: Run test — verify PASS**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t "xacNhan|tuChoi"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/giao-dich/services
git commit -m "feat(giao-dich): xacNhan/tuChoi + guard vai trò & trạng thái"
```

---

## Task 5: Service — nhánh đấu giá (thanh toán) + chi tiết lộ liên hệ

**Files:**
- Modify: `src/modules/giao-dich/services/giao-dich.service.ts`
- Modify: `src/modules/giao-dich/services/giao-dich.service.spec.ts`

- [ ] **Step 1: Thêm test cho luồng thanh toán + getChiTiet**

Thêm vào spec:

```typescript
  describe('luồng thanh toán (đấu giá)', () => {
    const base = {
      _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
      loaiPhien: LoaiPhien.DAU_GIA,
    };

    it('người thắng báo đã chuyển khoản → DA_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.baoDaChuyenKhoan('winner1', 'gd1', { anhChungTu: ['a.jpg'] });
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_THANH_TOAN);
      expect(res.anhChungTu).toEqual(['a.jpg']);
    });

    it('chủ phiên xác nhận nhận tiền → set mốc thời gian, vẫn DA_THANH_TOAN', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN, ...v }));

      const res = await service.xacNhanNhanTien('host1', 'gd1');
      expect(res.thoiDiemChuPhienXacNhanTien).toBeInstanceOf(Date);
    });

    it('chủ phiên hoàn tất → HOAN_TAT', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_THANH_TOAN });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.hoanTat('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.HOAN_TAT);
    });
  });

  describe('getChiTiet', () => {
    it('chưa xác nhận → không lộ liên hệ', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      const res = await service.getChiTiet('host1', 'gd1', 'USER');
      expect(res.lienHe).toBeUndefined();
    });

    it('đã xác nhận → lộ liên hệ 2 bên + thông tin CK chủ phiên', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN, giaChot: 500,
      });
      mockUsersService.getOne
        .mockResolvedValueOnce({ _id: 'host1', fullname: 'Chủ', email: 'h@x.com', phone: '0900000000', diaChi: 'HN', tenNganHang: 'VCB', soTaiKhoan: '123', tenTaiKhoan: 'CHU' })
        .mockResolvedValueOnce({ _id: 'winner1', fullname: 'Thắng', email: 'w@x.com', phone: '0911111111', diaChi: 'HCM' });

      const res = await service.getChiTiet('winner1', 'gd1', 'USER');
      expect(res.lienHe.chuPhien.email).toBe('h@x.com');
      expect(res.lienHe.nguoiThang.phone).toBe('0911111111');
      expect(res.thongTinChuyenKhoan.soTaiKhoan).toBe('123');
    });

    it('người ngoài cuộc → Forbidden', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      await expect(service.getChiTiet('nguoila', 'gd1', 'USER')).rejects.toThrow(ApiError);
    });
  });
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t "thanh toán|getChiTiet"`
Expected: FAIL — methods chưa tồn tại.

- [ ] **Step 3: Thêm methods nhánh đấu giá + getChiTiet**

Thêm vào class `GiaoDichService`:

```typescript
  async baoDaChuyenKhoan(userId: string, id: string, dto: DaChuyenKhoanDto): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_THANH_TOAN);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.DA_THANH_TOAN,
      anhChungTu: dto.anhChungTu ?? [],
      thoiDiemNguoiThangBaoDaCK: new Date(),
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_BAO_CK', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId],
      'GIAODICH_DA_THANH_TOAN',
      'Người thắng báo đã chuyển khoản',
      'Vui lòng kiểm tra và xác nhận đã nhận tiền.',
      id,
    );
    return updated;
  }

  async xacNhanNhanTien(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'CHU_PHIEN');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.DA_THANH_TOAN);

    const updated = await this.capNhat(id, { thoiDiemChuPhienXacNhanTien: new Date() });
    await this.auditLogService.logAction(userId, 'GIAODICH_XAC_NHAN_TIEN', 'GiaoDich', id, null, null);
    return updated;
  }

  async hoanTat(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'CHU_PHIEN');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.DA_THANH_TOAN);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.HOAN_TAT,
      thoiDiemHoanTat: new Date(),
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_HOAN_TAT', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId, gd.nguoiThangId],
      'GIAODICH_HOAN_TAT',
      'Giao dịch hoàn tất',
      'Giao dịch đã hoàn tất thành công.',
      id,
    );
    return updated;
  }

  async getChiTiet(userId: string, id: string, userRole: string): Promise<any> {
    const gd = await this.layVaKiemTra(id);
    const isChuPhien = gd.chuPhienId === userId;
    const isNguoiThang = gd.nguoiThangId === userId;
    const isAdmin = userRole === 'ADMIN';
    if (!isChuPhien && !isNguoiThang && !isAdmin) {
      throw ApiError.Forbidden('Bạn không có quyền xem giao dịch này');
    }

    const daXacNhan = gd.trangThai !== TrangThaiGiaoDich.CHO_XAC_NHAN
      && gd.trangThai !== TrangThaiGiaoDich.THAT_BAI;
    if (!daXacNhan) return { ...gd };

    const [chuPhien, nguoiThang] = await Promise.all([
      this.usersService.getOne({ where: { _id: gd.chuPhienId } }),
      this.usersService.getOne({ where: { _id: gd.nguoiThangId } }),
    ]);

    const lienHe = {
      chuPhien: this.trichLienHe(chuPhien),
      nguoiThang: this.trichLienHe(nguoiThang),
    };

    const result: any = { ...gd, lienHe };
    if (gd.loaiPhien === LoaiPhien.DAU_GIA && chuPhien) {
      result.thongTinChuyenKhoan = {
        tenNganHang: chuPhien.tenNganHang ?? null,
        soTaiKhoan: chuPhien.soTaiKhoan ?? null,
        tenTaiKhoan: chuPhien.tenTaiKhoan ?? null,
        soTien: gd.giaChot ?? null,
        noiDungCK: `GD ${gd._id}`,
      };
    }
    return result;
  }

  private trichLienHe(u: any): any {
    if (!u) return null;
    return { fullname: u.fullname, email: u.email, phone: u.phone, diaChi: u.diaChi ?? null };
  }
```

- [ ] **Step 4: Run test — verify PASS**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t "thanh toán|getChiTiet"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/giao-dich/services
git commit -m "feat(giao-dich): nhánh thanh toán đấu giá + getChiTiet lộ liên hệ"
```

---

## Task 6: Service — nhánh đấu thầu (ký HĐ + bàn giao) + ghi chú + hủy

**Files:**
- Modify: `src/modules/giao-dich/services/giao-dich.service.ts`
- Modify: `src/modules/giao-dich/services/giao-dich.service.spec.ts`

- [ ] **Step 1: Thêm test nhánh đấu thầu + ghi chú + hủy**

Thêm vào spec:

```typescript
  describe('luồng đấu thầu (ký HĐ + bàn giao)', () => {
    const base = {
      _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
      loaiPhien: LoaiPhien.DAU_THAU,
    };

    it('chủ phiên ký → chỉ set chuPhienDaKy, vẫn CHO_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, chuPhienDaKy: false, nguoiThangDaKy: false });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, nguoiThangDaKy: false, ...v }));

      const res = await service.kyHopDong('host1', 'gd1');
      expect(res.chuPhienDaKy).toBe(true);
      expect(res.trangThai).toBe(TrangThaiGiaoDich.CHO_KY_HOP_DONG);
    });

    it('người thắng ký khi chủ phiên đã ký → DA_KY_HOP_DONG', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.CHO_KY_HOP_DONG, chuPhienDaKy: true, nguoiThangDaKy: false });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, chuPhienDaKy: true, ...v }));

      const res = await service.kyHopDong('winner1', 'gd1');
      expect(res.nguoiThangDaKy).toBe(true);
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_KY_HOP_DONG);
    });

    it('chủ phiên bàn giao → DANG_BAN_GIAO', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DA_KY_HOP_DONG });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.banGiao('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DANG_BAN_GIAO);
      expect(res.daBanGiao).toBe(true);
    });

    it('người thắng xác nhận nhận → HOAN_TAT', async () => {
      repo.getById.mockResolvedValue({ ...base, trangThai: TrangThaiGiaoDich.DANG_BAN_GIAO });
      repo.updateOne.mockImplementation(async (v: any) => ({ ...base, ...v }));

      const res = await service.xacNhanNhan('winner1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.HOAN_TAT);
      expect(res.nguoiThangXacNhanNhan).toBe(true);
    });
  });

  describe('capNhatGhiChu', () => {
    it('chủ phiên cập nhật ghi chú của mình', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.capNhatGhiChu('host1', 'gd1', { ghiChu: 'Gặp 9h' });
      expect(res.ghiChuLienHeChuPhien).toBe('Gặp 9h');
    });

    it('chưa xác nhận → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
      });
      await expect(service.capNhatGhiChu('host1', 'gd1', { ghiChu: 'x' })).rejects.toThrow(ApiError);
    });
  });

  describe('huy', () => {
    it('chủ phiên hủy giao dịch non-terminal → DA_HUY', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.CHO_THANH_TOAN,
      });
      repo.updateOne.mockImplementation(async (v: any) => ({ _id: 'gd1', ...v }));

      const res = await service.huy('host1', 'gd1');
      expect(res.trangThai).toBe(TrangThaiGiaoDich.DA_HUY);
    });

    it('hủy giao dịch đã HOAN_TAT → BadRequest', async () => {
      repo.getById.mockResolvedValue({
        _id: 'gd1', nguoiThangId: 'winner1', chuPhienId: 'host1',
        loaiPhien: LoaiPhien.DAU_GIA, trangThai: TrangThaiGiaoDich.HOAN_TAT,
      });
      await expect(service.huy('host1', 'gd1')).rejects.toThrow(ApiError);
    });
  });

  describe('getPageMe', () => {
    it('lọc giao dịch mà tôi là chủ phiên HOẶC người thắng', async () => {
      repo.getPage.mockResolvedValue({ data: [], total: 0 } as any);
      await service.getPageMe('u1', {}, {});
      expect(repo.getPage).toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts -t "đấu thầu|capNhatGhiChu|huy|getPageMe"`
Expected: FAIL.

- [ ] **Step 3: Thêm methods nhánh đấu thầu + ghi chú + hủy + getPageMe**

Thêm `import { Op } from 'sequelize';` ở đầu file service. Thêm các method vào class:

```typescript
  async kyHopDong(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    const isChuPhien = gd.chuPhienId === userId;
    const isNguoiThang = gd.nguoiThangId === userId;
    if (!isChuPhien && !isNguoiThang) {
      throw ApiError.Forbidden('Bạn không có quyền ký hợp đồng này');
    }
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.CHO_KY_HOP_DONG);

    const chuPhienDaKy = isChuPhien ? true : gd.chuPhienDaKy;
    const nguoiThangDaKy = isNguoiThang ? true : gd.nguoiThangDaKy;
    const duHaiBen = chuPhienDaKy && nguoiThangDaKy;

    const updated = await this.capNhat(id, {
      chuPhienDaKy,
      nguoiThangDaKy,
      trangThai: duHaiBen ? TrangThaiGiaoDich.DA_KY_HOP_DONG : TrangThaiGiaoDich.CHO_KY_HOP_DONG,
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_KY_HD', 'GiaoDich', id, null, null);
    if (duHaiBen) {
      await this.guiThongBao(
        [gd.chuPhienId, gd.nguoiThangId],
        'GIAODICH_CAN_BAN_GIAO',
        'Hợp đồng đã ký đủ 2 bên',
        'Tiến hành bàn giao.',
        id,
      );
    }
    return updated;
  }

  async banGiao(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'CHU_PHIEN');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.DA_KY_HOP_DONG);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.DANG_BAN_GIAO,
      daBanGiao: true,
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_BAN_GIAO', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.nguoiThangId],
      'GIAODICH_CAN_XAC_NHAN_NHAN',
      'Chủ phiên đã bàn giao',
      'Vui lòng xác nhận đã nhận để hoàn tất.',
      id,
    );
    return updated;
  }

  async xacNhanNhan(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'NGUOI_THANG');
    this.kiemTraTrangThai(gd, TrangThaiGiaoDich.DANG_BAN_GIAO);

    const updated = await this.capNhat(id, {
      trangThai: TrangThaiGiaoDich.HOAN_TAT,
      nguoiThangXacNhanNhan: true,
      thoiDiemHoanTat: new Date(),
    });
    await this.auditLogService.logAction(userId, 'GIAODICH_XAC_NHAN_NHAN', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId, gd.nguoiThangId],
      'GIAODICH_HOAN_TAT',
      'Giao dịch hoàn tất',
      'Giao dịch đã hoàn tất thành công.',
      id,
    );
    return updated;
  }

  async capNhatGhiChu(userId: string, id: string, dto: GhiChuDto): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    const isChuPhien = gd.chuPhienId === userId;
    const isNguoiThang = gd.nguoiThangId === userId;
    if (!isChuPhien && !isNguoiThang) {
      throw ApiError.Forbidden('Bạn không có quyền ghi chú giao dịch này');
    }
    const daXacNhan = gd.trangThai !== TrangThaiGiaoDich.CHO_XAC_NHAN
      && gd.trangThai !== TrangThaiGiaoDich.THAT_BAI
      && gd.trangThai !== TrangThaiGiaoDich.DA_HUY;
    if (!daXacNhan) {
      throw ApiError.BadRequest('Chỉ ghi chú liên hệ sau khi giao dịch được xác nhận');
    }

    const values = isChuPhien
      ? { ghiChuLienHeChuPhien: dto.ghiChu }
      : { ghiChuLienHeNguoiThang: dto.ghiChu };
    return this.capNhat(id, values);
  }

  async huy(userId: string, id: string): Promise<GiaoDich> {
    const gd = await this.layVaKiemTra(id);
    this.kiemTraVai(gd, userId, 'CHU_PHIEN');
    const terminal = [TrangThaiGiaoDich.HOAN_TAT, TrangThaiGiaoDich.THAT_BAI, TrangThaiGiaoDich.DA_HUY];
    if (terminal.includes(gd.trangThai)) {
      throw ApiError.BadRequest('Giao dịch đã kết thúc, không thể hủy');
    }
    const updated = await this.capNhat(id, { trangThai: TrangThaiGiaoDich.DA_HUY });
    await this.auditLogService.logAction(userId, 'GIAODICH_HUY', 'GiaoDich', id, null, null);
    await this.guiThongBao(
      [gd.chuPhienId, gd.nguoiThangId],
      'GIAODICH_THAT_BAI',
      'Giao dịch đã bị hủy',
      'Chủ phiên đã hủy giao dịch này.',
      id,
    );
    return updated;
  }

  async getPageMe(
    userId: string,
    condition: ConditionGiaoDichDto,
    query: QueryOption,
  ): Promise<PageableDto<GiaoDich>> {
    return this.giaoDichRepository.getPage(
      {
        where: {
          ...(condition as any),
          [Op.or]: [{ chuPhienId: userId }, { nguoiThangId: userId }],
        },
      },
      query,
    );
  }
```

- [ ] **Step 4: Run test — verify PASS toàn bộ service spec**

Run: `npx jest src/modules/giao-dich/services/giao-dich.service.spec.ts`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/modules/giao-dich/services
git commit -m "feat(giao-dich): nhánh đấu thầu, ghi chú, hủy, getPageMe"
```

---

## Task 7: Controller + spec

**Files:**
- Create: `src/modules/giao-dich/controllers/giao-dich.controller.ts`
- Create: `src/modules/giao-dich/controllers/giao-dich.controller.spec.ts`

- [ ] **Step 1: Viết test controller (phân quyền + delegate)**

Create `src/modules/giao-dich/controllers/giao-dich.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GiaoDichController } from './giao-dich.controller';
import { GiaoDichService } from '../services/giao-dich.service';

describe('GiaoDichController', () => {
  let controller: GiaoDichController;
  const mockService = {
    getPageMe: jest.fn().mockResolvedValue({ data: [] }),
    getChiTiet: jest.fn().mockResolvedValue({ _id: 'gd1' }),
    xacNhan: jest.fn().mockResolvedValue({}),
    tuChoi: jest.fn().mockResolvedValue({}),
    capNhatGhiChu: jest.fn().mockResolvedValue({}),
    baoDaChuyenKhoan: jest.fn().mockResolvedValue({}),
    xacNhanNhanTien: jest.fn().mockResolvedValue({}),
    hoanTat: jest.fn().mockResolvedValue({}),
    kyHopDong: jest.fn().mockResolvedValue({}),
    banGiao: jest.fn().mockResolvedValue({}),
    xacNhanNhan: jest.fn().mockResolvedValue({}),
    huy: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiaoDichController],
      providers: [{ provide: GiaoDichService, useValue: mockService }],
    }).compile();
    controller = module.get<GiaoDichController>(GiaoDichController);
  });

  afterEach(() => jest.clearAllMocks());

  it('getChiTiet truyền userId + role từ token', async () => {
    await controller.getChiTiet({ id: 'u1', role: 'USER' } as any, 'gd1');
    expect(mockService.getChiTiet).toHaveBeenCalledWith('u1', 'gd1', 'USER');
  });

  it('xacNhan delegate đúng', async () => {
    await controller.xacNhan({ id: 'winner1' } as any, 'gd1');
    expect(mockService.xacNhan).toHaveBeenCalledWith('winner1', 'gd1');
  });

  it('baoDaChuyenKhoan truyền dto', async () => {
    await controller.baoDaChuyenKhoan({ id: 'winner1' } as any, 'gd1', { anhChungTu: ['a.jpg'] } as any);
    expect(mockService.baoDaChuyenKhoan).toHaveBeenCalledWith('winner1', 'gd1', { anhChungTu: ['a.jpg'] });
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `npx jest src/modules/giao-dich/controllers/giao-dich.controller.spec.ts`
Expected: FAIL — "Cannot find module './giao-dich.controller'".

- [ ] **Step 3: Viết controller**

Create `src/modules/giao-dich/controllers/giao-dich.controller.ts`:

```typescript
import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GiaoDichService } from '../services/giao-dich.service';
import { ConditionGiaoDichDto } from '../dto/condition-giao-dich.dto';
import { DaChuyenKhoanDto } from '../dto/da-chuyen-khoan.dto';
import { GhiChuDto } from '../dto/ghi-chu.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';

@ApiTags('Giao dịch hậu đấu giá/đấu thầu')
@Auth()
@Controller('giao-dich')
export class GiaoDichController {
  constructor(private readonly giaoDichService: GiaoDichService) {}

  @ApiOperation({ summary: 'Danh sách giao dịch của tôi (chủ phiên hoặc người thắng)' })
  @Get('me')
  async getPageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionGiaoDichDto) condition: ConditionGiaoDichDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.giaoDichService.getPageMe(user.id, condition, query);
  }

  @ApiOperation({ summary: 'Chi tiết giao dịch (kèm liên hệ + thông tin CK nếu đã xác nhận)' })
  @Get(':id')
  async getChiTiet(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.getChiTiet(user.id, id, user.role);
  }

  @ApiOperation({ summary: 'Người thắng xác nhận nhận giao dịch' })
  @Post(':id/xac-nhan')
  async xacNhan(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhan(user.id, id);
  }

  @ApiOperation({ summary: 'Người thắng từ chối giao dịch' })
  @Post(':id/tu-choi')
  async tuChoi(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.tuChoi(user.id, id);
  }

  @ApiOperation({ summary: 'Cập nhật ghi chú liên hệ của tôi' })
  @Put(':id/ghi-chu')
  async capNhatGhiChu(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: GhiChuDto,
  ) {
    return this.giaoDichService.capNhatGhiChu(user.id, id, dto);
  }

  @ApiOperation({ summary: '[Đấu giá] Người thắng báo đã chuyển khoản' })
  @Post(':id/da-chuyen-khoan')
  async baoDaChuyenKhoan(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: DaChuyenKhoanDto,
  ) {
    return this.giaoDichService.baoDaChuyenKhoan(user.id, id, dto);
  }

  @ApiOperation({ summary: '[Đấu giá] Chủ phiên xác nhận đã nhận tiền' })
  @Post(':id/xac-nhan-tien')
  async xacNhanNhanTien(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhanNhanTien(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu giá] Chủ phiên chốt hoàn tất' })
  @Post(':id/hoan-tat')
  async hoanTat(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.hoanTat(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Đánh dấu mình đã ký hợp đồng' })
  @Post(':id/ky-hop-dong')
  async kyHopDong(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.kyHopDong(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Chủ phiên đánh dấu đã bàn giao' })
  @Post(':id/ban-giao')
  async banGiao(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.banGiao(user.id, id);
  }

  @ApiOperation({ summary: '[Đấu thầu] Người thắng xác nhận đã nhận' })
  @Post(':id/xac-nhan-nhan')
  async xacNhanNhan(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.xacNhanNhan(user.id, id);
  }

  @ApiOperation({ summary: 'Chủ phiên hủy giao dịch' })
  @Post(':id/huy')
  async huy(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.giaoDichService.huy(user.id, id);
  }
}
```

- [ ] **Step 4: Run — verify PASS**

Run: `npx jest src/modules/giao-dich/controllers/giao-dich.controller.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/giao-dich/controllers
git commit -m "feat(giao-dich): controller + spec"
```

---

## Task 8: Module + đăng ký app.module

**Files:**
- Create: `src/modules/giao-dich/giao-dich.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Tạo module**

Create `src/modules/giao-dich/giao-dich.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GiaoDichModel } from './models/giao-dich.model';
import { GiaoDichController } from './controllers/giao-dich.controller';
import { GiaoDichService } from './services/giao-dich.service';
import { GiaoDichRepository } from './repositories/giao-dich.repository';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([GiaoDichModel]), UsersModule],
  controllers: [GiaoDichController],
  providers: [GiaoDichService, GiaoDichRepository],
  exports: [GiaoDichService, GiaoDichRepository],
})
export class GiaoDichModule {}
```

> Notification + AuditLog là `@Global()` nên không cần import. `UsersModule` cần import để inject `UsersService`.

- [ ] **Step 2: Đăng ký vào app.module**

Modify `src/app.module.ts`:
- Thêm import sau dòng 31: `import { GiaoDichModule } from './modules/giao-dich/giao-dich.module';`
- Thêm `GiaoDichModule,` vào mảng `imports` (sau `BaoCaoUserModule,`).

- [ ] **Step 3: Build kiểm tra**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/modules/giao-dich/giao-dich.module.ts src/app.module.ts
git commit -m "feat(giao-dich): module + đăng ký app.module"
```

---

## Task 9: Tích hợp auction.service + tender.service gọi taoTuPhien

**Files:**
- Modify: `src/modules/auction/auction.module.ts`
- Modify: `src/modules/auction/services/auction.service.ts`
- Modify: `src/modules/auction/services/auction.service.spec.ts`
- Modify: `src/modules/tender/tender.module.ts`
- Modify: `src/modules/tender/services/tender.service.ts`
- Modify: `src/modules/tender/services/tender.service.spec.ts`

> **DI một chiều:** `AuctionModule`/`TenderModule` import `GiaoDichModule` (export `GiaoDichService`). `GiaoDichModule` KHÔNG import lại 2 module này → không circular.

- [ ] **Step 1: auction.module import GiaoDichModule**

Modify `src/modules/auction/auction.module.ts`:
- Thêm import: `import { GiaoDichModule } from '@/modules/giao-dich/giao-dich.module';`
- Sửa `imports: [ScoringModule, NotificationModule]` → `imports: [ScoringModule, NotificationModule, GiaoDichModule]`

- [ ] **Step 2: auction.service inject + gọi taoTuPhien**

Modify `src/modules/auction/services/auction.service.ts`:
- Thêm import: `import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';`
- Thêm import: `import { LoaiPhien } from '@/modules/scoring/common/constants';` (gộp vào dòng import constants có sẵn: `import { TrangThaiPhien, TrangThaiDeXuat, LoaiPhien } from '@/modules/scoring/common/constants';`)
- Thêm vào constructor (sau `private readonly sequelize: Sequelize,`): `private readonly giaoDichService: GiaoDichService,`
- Trong `evaluateSession`, ngay sau block gửi notification (sau dòng 411 `}` đóng `catch`), trước `return this.getRanking(...)`, thêm:

```typescript
    if (winnerUserId) {
      try {
        await this.giaoDichService.taoTuPhien({
          phienId: sessionId,
          loaiPhien: LoaiPhien.DAU_GIA,
          chuPhienId: session.chuPhienId,
          nguoiThangId: winnerUserId,
          giaChot: highestBidPrice,
        });
      } catch (err) {
        console.error('Failed to create giao dich (auction):', err);
      }
    }
```

- [ ] **Step 3: Cập nhật auction.service.spec — mock GiaoDichService**

Modify `src/modules/auction/services/auction.service.spec.ts`:
- Thêm import: `import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';`
- Thêm provider vào mảng `providers` (sau provider `Sequelize`):

```typescript
        {
          provide: GiaoDichService,
          useValue: { taoTuPhien: jest.fn().mockResolvedValue({ _id: 'gd1' }) },
        },
```

- [ ] **Step 4: tender.module import GiaoDichModule**

Modify `src/modules/tender/tender.module.ts`:
- Thêm import: `import { GiaoDichModule } from '@/modules/giao-dich/giao-dich.module';`
- Sửa `imports: [ScoringModule, NotificationModule]` → `imports: [ScoringModule, NotificationModule, GiaoDichModule]`

- [ ] **Step 5: tender.service inject + gọi taoTuPhien**

Modify `src/modules/tender/services/tender.service.ts`:
- Thêm import: `import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';`
- Đảm bảo `LoaiPhien` có trong import constants (gộp vào dòng import từ `scoring/common/constants`).
- Thêm vào constructor: `private readonly giaoDichService: GiaoDichService,`
- Trong `evaluateSession`, sau block gửi notification (sau dòng 464 đóng `catch`), trước `return this.getSessionDetails(sessionId);`, thêm:

```typescript
    if (winnerUserId) {
      try {
        await this.giaoDichService.taoTuPhien({
          phienId: sessionId,
          loaiPhien: LoaiPhien.DAU_THAU,
          chuPhienId: session.chuPhienId,
          nguoiThangId: winnerUserId,
        });
      } catch (err) {
        console.error('Failed to create giao dich (tender):', err);
      }
    }
```

- [ ] **Step 6: Cập nhật tender.service.spec — mock GiaoDichService**

Modify `src/modules/tender/services/tender.service.spec.ts`:
- Thêm import: `import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';`
- Thêm provider vào mảng `providers`:

```typescript
        {
          provide: GiaoDichService,
          useValue: { taoTuPhien: jest.fn().mockResolvedValue({ _id: 'gd1' }) },
        },
```

- [ ] **Step 7: Run toàn bộ test liên quan**

Run: `npx jest src/modules/auction src/modules/tender src/modules/giao-dich`
Expected: PASS toàn bộ (không phá vỡ test cũ).

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/modules/auction src/modules/tender
git commit -m "feat(giao-dich): tích hợp evaluateSession tạo giao dịch (auction + tender)"
```

---

## Task 10: Cron quá hạn 48h

**Files:**
- Modify: `src/modules/cron-job/cron-job.module.ts`
- Modify: `src/modules/cron-job/cron-job.service.ts`

- [ ] **Step 1: cron-job.module import GiaoDichModule**

Modify `src/modules/cron-job/cron-job.module.ts`:
- Thêm import: `import { GiaoDichModule } from '../giao-dich/giao-dich.module';`
- Thêm `GiaoDichModule` vào mảng `imports`.

- [ ] **Step 2: Thêm method `xuLyGiaoDichQuaHan` + gọi trong handleCron**

Modify `src/modules/cron-job/cron-job.service.ts`:
- Thêm import:
```typescript
import { GiaoDichService } from '@/modules/giao-dich/services/giao-dich.service';
import { TrangThaiGiaoDich, LyDoThatBai } from '@/modules/giao-dich/common/constants';
```
- Thêm vào constructor: `private readonly giaoDichService: GiaoDichService,`
- Thêm method mới trong class:

```typescript
  async xuLyGiaoDichQuaHan(): Promise<void> {
    try {
      const now = new Date();
      const quaHan = await this.giaoDichService.getMany({
        where: {
          trangThai: TrangThaiGiaoDich.CHO_XAC_NHAN,
          hanXacNhan: { [Op.lt]: now },
        },
      });
      for (const gd of quaHan) {
        try {
          await this.giaoDichService.updateOne(
            { trangThai: TrangThaiGiaoDich.THAT_BAI, lyDoThatBai: LyDoThatBai.QUA_HAN },
            { where: { _id: gd._id } },
          );
        } catch (e) {
          this.logger.error(`Error failing giao dich ${gd._id}:`, e);
        }
      }
      if (quaHan.length > 0) {
        this.logger.log(`Marked ${quaHan.length} giao dich as THAT_BAI (qua han).`);
      }
    } catch (error) {
      this.logger.error('Error processing overdue giao dich:', error);
    }
  }
```
- Trong `handleCron()`, thêm dòng gọi ở cuối (sau block xử lý auction):
```typescript
    // 3. Process overdue giao dich (48h confirm deadline)
    await this.xuLyGiaoDichQuaHan();
```

> `getMany`/`updateOne` kế thừa từ `BaseService` (`GiaoDichService extends BaseService`). `Op` đã được import sẵn trong `cron-job.service.ts:6`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Run test toàn bộ**

Run: `npm test`
Expected: PASS toàn bộ (83 test cũ + test giao-dich mới).

- [ ] **Step 5: Commit**

```bash
git add src/modules/cron-job
git commit -m "feat(giao-dich): cron quét quá hạn xác nhận 48h"
```

---

## Task 11: Cập nhật STATE.md

**Files:**
- Modify: `STATE.md`

- [ ] **Step 1: Thêm phase BACK-12 vào bảng tổng quan**

Modify `STATE.md` — thêm dòng vào bảng tổng quan (sau BACK-11):

```markdown
| BACK-12 | Giao Dịch Hậu Kỳ | ✅ DONE |
```

- [ ] **Step 2: Thêm chi tiết phase**

Thêm section sau BACK-11 (mô tả module giao-dich: enum, entity/model/repo, service state machine, controller, tích hợp evaluateSession, cron 48h). Cập nhật dòng "Đang ở:" và "_Last updated:_".

- [ ] **Step 3: Commit**

```bash
git add STATE.md
git commit -m "docs(state): cập nhật BACK-12 Giao Dịch Hậu Kỳ"
```

---

## Self-Review

**1. Spec coverage** (đối chiếu spec):
- Xác nhận 48h + cron quá hạn → Task 3 (taoTuPhien set hanXacNhan), Task 4 (xacNhan/tuChoi), Task 10 (cron). ✅
- Đấu giá thanh toán (mock + thông tin CK) → Task 5. ✅ (thông tin CK lấy realtime từ user — điều chỉnh đã ghi rõ)
- Đấu thầu ký HĐ + bàn giao → Task 6. ✅
- Lộ liên hệ 2 bên (từ user) + ô ghi chú → Task 5 (getChiTiet), Task 6 (capNhatGhiChu). ✅
- Từ chối/quá hạn → THAT_BAI, không mời người kế → Task 4 + Task 10. ✅
- Báo cáo người bỏ kèo → tái dùng `bao-cao-user` sẵn có, không thêm endpoint. ✅ (ghi trong spec)
- Hủy (optional) → Task 6 (huy). ✅
- Notification + audit hook → rải trong các method. ✅
- DI một chiều tránh circular → Task 9 note. ✅

**2. Placeholder scan:** Không có TBD/TODO. Mọi step có code/lệnh cụ thể.

**3. Type consistency:**
- Enum `TrangThaiGiaoDich`, `LyDoThatBai`, `HAN_XAC_NHAN_GIO` định nghĩa Task 1, dùng nhất quán.
- Method names: `taoTuPhien`, `xacNhan`, `tuChoi`, `baoDaChuyenKhoan`, `xacNhanNhanTien`, `hoanTat`, `kyHopDong`, `banGiao`, `xacNhanNhan`, `capNhatGhiChu`, `huy`, `getChiTiet`, `getPageMe` — controller (Task 7) gọi khớp tên service (Task 3-6). ✅
- `TaoTuPhienInput` interface dùng ở service (Task 3) + callers (Task 9) khớp field. ✅
- Helper `guiThongBao`, `layVaKiemTra`, `kiemTraVai`, `kiemTraTrangThai`, `capNhat`, `trichLienHe` — định nghĩa Task 3-5, dùng xuyên suốt. ✅

**Lưu ý môi trường:** Node ≥16 để `nest build`/jest mới (theo STATE.md: Node v14 không tương thích ts-jest). Đảm bảo dùng Node ≥16 khi chạy plan.
