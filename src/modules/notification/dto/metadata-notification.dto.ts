import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { ModuleNotification, PhanHeNotification } from "../common/constant";

export class MetadataNotificationDto {
  @IsEnum(PhanHeNotification)
  phanHe: PhanHeNotification;

  @IsEnum(ModuleNotification)
  @IsOptional()
  module?: ModuleNotification;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsObject()
  @IsOptional()
  extra?: Record<string, any>;
}
