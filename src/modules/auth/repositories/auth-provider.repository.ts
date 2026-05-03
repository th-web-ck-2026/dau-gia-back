import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { AuthProvider } from '../entities/auth-provider.entity';
import { AuthProviderModel } from '../models/auth-provider.model';

@Injectable()
export class AuthProviderRepository extends BaseRepository<AuthProvider> {
  constructor() {
    super(AuthProviderModel);
  }
}
