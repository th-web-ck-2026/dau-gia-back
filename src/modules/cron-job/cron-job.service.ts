import { Injectable } from '@nestjs/common';

@Injectable()
export class CronJobService {
  constructor() {}
  async run() {
    console.log('CronJobService is running');
  }
}
