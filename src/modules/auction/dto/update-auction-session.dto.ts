import { PartialType } from '@nestjs/swagger';
import { CreateAuctionSessionDto } from './create-auction-session.dto';

export class UpdateAuctionSessionDto extends PartialType(CreateAuctionSessionDto) {}
