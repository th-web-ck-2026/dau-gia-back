import { Module } from "@nestjs/common";
import { RecaptchaStrategy } from "./strategy/recaptcha.strategy";

@Module({
    providers: [RecaptchaStrategy],
    exports: [RecaptchaStrategy],
})
export class RecaptchaModule {}
