import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { DonViHanhChinh } from '../entities/don-vi-hanh-chinh.entity';
import { DonViHanhChinhRepository } from '../repositories/don-vi-hanh-chinh.repository';

@Injectable()
export class DonViHanhChinhService
  extends BaseService<DonViHanhChinh>
  implements OnModuleInit
{
  constructor(
    private readonly donViHanhChinhRepository: DonViHanhChinhRepository,
  ) {
    super(donViHanhChinhRepository);
  }
  async onModuleInit() {
    const tinhThanh = await this.getMany({ where: { level: 1 } });
    if (tinhThanh.length === 0) {
      const tinhThanhData = await import('../data/province.json').then(
        (data) => data.default as DonViHanhChinh[],
      );
      await this.donViHanhChinhRepository.insertMany(tinhThanhData);
    }
  }
}
