import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ApiError } from '@Exceptions/api-error';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { PageableDto } from '@/common/dto/pageable.dto';
import { BaoCaoUser } from '../entities/bao-cao-user.entity';
import { BaoCaoUserRepository } from '../repositories/bao-cao-user.repository';
import { CreateBaoCaoUserDto } from '../dto/create-bao-cao-user.dto';
import { ConditionBaoCaoUserDto } from '../dto/condition-bao-cao-user.dto';
import { ReplyBaoCaoUserDto } from '../dto/reply-bao-cao-user.dto';
import { TrangThaiBaoCao } from '../common/constants';
import { UsersService } from '@/modules/user/services/user.service';
import { NotificationService } from '@/modules/notification/services/notification.service';

@Injectable()
export class BaoCaoUserService extends BaseService<BaoCaoUser> {
  constructor(
    private readonly baoCaoUserRepository: BaoCaoUserRepository,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {
    super(baoCaoUserRepository);
  }

  async taoBaoCao(user: AuthUser, dto: CreateBaoCaoUserDto): Promise<BaoCaoUser> {
    if (user.id === dto.nguoiBiToCaoId) {
      throw ApiError.BadRequest('Không thể tự tố cáo chính mình');
    }

    const nguoiBiToCao = await this.usersService.getOne({
      where: { _id: dto.nguoiBiToCaoId },
      attributes: ['_id'],
    });
    if (!nguoiBiToCao) {
      throw ApiError.NotFound('Người bị tố cáo không tồn tại');
    }

    return this.baoCaoUserRepository.create({
      ...dto,
      nguoiToCaoId: user.id,
      trangThai: TrangThaiBaoCao.CHUA_XU_LY,
    });
  }

  async getPageMe(
    userId: string,
    condition: ConditionBaoCaoUserDto,
    query: QueryOption,
  ): Promise<PageableDto<BaoCaoUser>> {
    return this.baoCaoUserRepository.getPage(
      {
        where: { ...(condition as any), nguoiToCaoId: userId },
      },
      query,
    );
  }

  async getPageAdmin(
    condition: ConditionBaoCaoUserDto,
    query: QueryOption,
  ): Promise<PageableDto<BaoCaoUser>> {
    return this.baoCaoUserRepository.getPage(
      {
        where: condition as any,
      },
      query,
    );
  }

  async traLoiBaoCao(
    adminId: string,
    id: string,
    dto: ReplyBaoCaoUserDto,
  ): Promise<BaoCaoUser> {
    const baoCao = await this.baoCaoUserRepository.getById(id);
    if (!baoCao) {
      throw ApiError.NotFound('Báo cáo không tồn tại');
    }

    const updated = await this.baoCaoUserRepository.updateOne(
      {
        phanHoiAdmin: dto.phanHoiAdmin,
        adminXuLyId: adminId,
        thoiGianXuLy: new Date(),
        trangThai: TrangThaiBaoCao.DA_XU_LY,
      },
      { where: { _id: id } },
    );

    try {
      await this.notificationService.createNotification({
        userIds: [baoCao.nguoiToCaoId],
        type: 'HE_THONG',
        title: 'Admin đã trả lời báo cáo của bạn',
        content: `Báo cáo "${baoCao.tieuDe}" đã được xử lý.`,
        metadata: { targetId: id, extra: { baoCaoId: id } },
      } as any);
    } catch (err) {
      // Không chặn flow trả lời nếu gửi thông báo lỗi
    }

    return updated;
  }
}
