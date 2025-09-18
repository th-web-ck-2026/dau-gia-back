import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { User } from 'src/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import { Bid } from '@/modules/bid/entities/bid.entity';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { join } from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { MailConfigService } from '@/modules/mail-config/services/mail-config.service';
import { MailConfig } from '@/modules/mail-config/entities/mail-config.entity';

@Injectable()
export class SendMailService {
  private transporters: Transporter<SentMessageInfo>[];
  private currentTransporterIndex = 0;
  private templates: { [key: string]: handlebars.TemplateDelegate } = {};

  private readonly platformName: string;
  private readonly platformUrl: string;
  private readonly platformLogoUrl: string;
  private mailConfigs: MailConfig[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly mailConfigService: MailConfigService,
  ) {
    this.platformName = this.configService.get<string>('PLATFORM_NAME');
    this.platformUrl = this.configService.get<string>('PLATFORM_URL');
    this.platformLogoUrl = this.configService.get<string>('PLATFORM_LOGO_URL');
    this.loadTemplates();
  }

  async loadMailConfigs() {
    this.mailConfigs = await this.mailConfigService.getMany({
      where: { is_active: true },
    });
    this.transporters = this.mailConfigs.map((serverConfig) => {
      return nodemailer.createTransport({
        host: serverConfig.host,
        port: serverConfig?.port ? serverConfig.port : null,
        secure: serverConfig?.port ? serverConfig.port === 465 : null, // Use secure for port 465
        auth: {
          user: serverConfig.user,
          pass: serverConfig.pass,
        },
        tls: {
        rejectUnauthorized: false,
      }
      });
    });

    if (this.transporters.length === 0) {
      Logger.warn('No mail transporters configured.', 'SendMailService');
    }
  }

  private loadTemplates() {
    const templatesDir = join(__dirname, '..', 'templates');
    fs.readdirSync(templatesDir).forEach((file) => {
      if (file.endsWith('.hbs')) {
        const templateName = file.replace('.hbs', '');
        const templatePath = join(templatesDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        this.templates[templateName] = handlebars.compile(templateContent);
      }
    });
  }

  private getNextTransporter(): Transporter<SentMessageInfo> {
    const transporter = this.transporters[this.currentTransporterIndex];
    this.currentTransporterIndex =
      (this.currentTransporterIndex + 1) % this.transporters.length;
    return transporter;
  }

  private renderTemplate(template: string, context: any): string {
    if (!this.templates[template]) {
      throw new Error(`Template ${template} not found.`);
    }
    return this.templates[template](context);
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    await this.loadMailConfigs();

    if (!this.transporters || this.transporters.length === 0) {
      Logger.error('No mail transporters configured.', 'SendMailService');
      throw new Error('No mail transporters configured.');
    }

    const maxRetries = this.transporters.length;
    for (let i = 0; i < maxRetries; i++) {
      const transporter = this.getNextTransporter();
      const currentConfigIndex =
        (this.currentTransporterIndex - 1 + this.transporters.length) %
        this.transporters.length;
      const from = this.mailConfigs[currentConfigIndex].user;

      try {
        await transporter.sendMail({
          ...mailOptions,
          from: `"${this.platformName}" <${from}>`,
        });
        Logger.log(
          `Email sent successfully to ${mailOptions.to} using ${from}`,
        );
        return;
      } catch (error) {
        Logger.error(
          `Failed to send email to ${mailOptions.to} using ${from}`,
          error.stack,
          'SendMailService',
        );
      }
    }
    Logger.error(
      `All mail transporters failed to send email to ${mailOptions.to}`,
      '',
      'SendMailService',
    );
    throw new Error(
      'Unable to send email after trying all available transporters.',
    );
  }

  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    const html = this.renderTemplate('welcome', {
      name: user.fullname,
      url,
      platformName: 'Cổng gia sư',
      currentYear: new Date().getFullYear(),
    });

    await this.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      html: html,
    });
  }

  async sendPasswordReset(user: User, token: string): Promise<void> {
    const subject = `Yêu cầu đặt lại mật khẩu cho tài khoản ${this.platformName} của bạn`;

    const expiresInMinutes = this.configService.get<string>(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES',
    );

    const resetUrl = `${this.platformUrl}/reset-password.html?token=${token}`;

    const emailContext = {
      subject: subject,
      userName: user.fullname,
      resetUrl: resetUrl,
      expiresInMinutes: expiresInMinutes,
      platformName: this.platformName,
      platformUrl: this.platformUrl,
      platformLogoUrl: this.platformLogoUrl,
      currentYear: new Date().getFullYear(),
    };

    const html = this.renderTemplate('reset-password', emailContext);

    await this.sendMail({
      to: user.email,
      subject: subject,
      html: html,
    });
  }

  async sendBidCreate(student: User, bid: Bid, tutor: User, tutorClass: Class) {
    const context = {
      subject: `Đề xuất giá mới cho lớp học: ${tutorClass.title}`,
      tutorName: tutor.fullname,
      studentName: student.fullname,
      classTitle: tutorClass.title,
      bidPrice: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(bid.bid_price),
      classUrl: `https://conggiasu.com/quan-ly-lop.html`,
      platformName: 'Cổng gia sư',
      platformUrl: 'https://conggiasu.com',
      platformLogoUrl: 'http://conggiasu.com/assets/img/logo.png',
      currentYear: new Date().getFullYear(),
    };
    const html = this.renderTemplate('bid-create', context);
    await this.sendMail({
      to: tutor.email,
      subject: `Đề xuất giá mới cho lớp học: ${tutorClass.title}`,
      html: html,
    });
  }

  async sendTutorSelectBid(
    student: User,
    bid: Bid,
    tutor: User,
    tutorClass: Class,
  ) {
    const context = {
      subject: `Đề xuất của bạn cho lớp "${tutorClass.title}" đã được chấp nhận!`,
      studentName: student.fullname,
      classTitle: tutorClass.title,
      tutorName: tutor.fullname,
      acceptedPrice: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(bid.bid_price),
      classUrl: `https://conggiasu.com/quan-ly-lop.html`,
      platformName: 'Cổng gia sư',
      platformUrl: 'https://conggiasu.com',
      platformLogoUrl: 'http://conggiasu.com/assets/img/logo.png',
      currentYear: new Date().getFullYear(),
    };
    const html = this.renderTemplate('tutor-select-bid', context);
    await this.sendMail({
      to: student.email,
      subject: `Đề xuất của bạn cho lớp "${tutorClass.title}" đã được chấp nhận!`,
      html: html,
    });
  }
}
