import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { AuthSession } from '../entities/auth-session.entity';
import { AuthSessionModel } from '../models/auth-session.model';

@Injectable()
export class AuthSessionRepository extends BaseRepository<AuthSession> {
  constructor() {
    super(AuthSessionModel);
  }
}
