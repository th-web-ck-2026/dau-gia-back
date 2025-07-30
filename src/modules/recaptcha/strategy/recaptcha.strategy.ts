import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { ApiError } from '@/common/exceptions/api-error';

@Injectable()
export class RecaptchaStrategy extends PassportStrategy(Strategy, 'recaptcha') {
  private readonly secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
  private readonly googleUri = process.env.RECAPTCHA_URI || "";

  async validate(req: Request): Promise<any> {
    const token = req.body?.recaptchaToken || req.headers['x-recaptcha-token'];
    const type = req.body?.recaptchaType || 'v3';
    const action = req.body?.recaptchaAction;
    // setting score
    const scoreThreshold = 0.7;

    if (!token) {
      throw ApiError.Unauthorized('Missing reCAPTCHA token');
    }

    const response = await axios.post(
      this.googleUri,
      new URLSearchParams({
        secret: this.secretKey,
        response: token,
      }),
    );

    const data = response.data;
    console.log(data);
    if (!data.success) {
      throw ApiError.Unauthorized('Invalid reCAPTCHA token');
    }

    if (type === 'v3') {
      if (action && data.action !== action) {
        throw ApiError.Unauthorized('reCAPTCHA action mismatch');
      }
      if (data.score < scoreThreshold) {
        throw ApiError.Unauthorized('reCAPTCHA score too low');
      }
    }

    return { recaptcha: true };
  }
}
