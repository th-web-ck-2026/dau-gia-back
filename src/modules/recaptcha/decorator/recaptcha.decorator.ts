import { applyDecorators, UseGuards } from "@nestjs/common";
import { RecaptchaGuard } from "../guard/recaptcha.guard";

export const UseRecaptcha = () => applyDecorators(UseGuards(RecaptchaGuard));
