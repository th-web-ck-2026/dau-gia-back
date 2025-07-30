import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { DepositPackage } from '../entities/deposit-package.entity';
import { DepositPackageRepository } from '../repositories/deposit-package.repository';

@Injectable()
export class DepositPackageService
  extends BaseService<DepositPackage>
  implements OnModuleInit
{
  constructor(
    private readonly depositPackageRepository: DepositPackageRepository,
  ) {
    super(depositPackageRepository);
  }
  async onModuleInit() {
    await this.initDepositPackages();
  }
  async initDepositPackages(): Promise<void> {
    console.log('Init Deposit Packages');
    const existingPackages = await this.depositPackageRepository.exists({});
    if (existingPackages) {
      console.log('Deposit packages already exist, skipping initialization.');
      return;
    }
    const depositPackages = [
      {
        amount: 100000,
        promotion: 0,
      },
      {
        amount: 200000,
        promotion: 10000,
      },
      {
        amount: 500000,
        promotion: 30000,
      },
      { amount: 1000000, promotion: 80000 },
      {
        amount: 2000000,
        promotion: 200000,
      },
    ];
    this.depositPackageRepository.insertMany(depositPackages);
  }
}
