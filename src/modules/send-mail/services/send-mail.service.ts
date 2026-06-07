import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { User } from 'src/modules/user/entities/user.entity';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { join } from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { MailConfigService } from '@/modules/mail-config/services/mail-config.service';
import { MailConfig } from '@/modules/mail-config/entities/mail-config.entity';
import { Resend } from 'resend';

@Injectable()
export class SendMailService {
  private transporters: Transporter[];
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
      if (serverConfig.host === 'smtp.resend.com') {
        Logger.log(
          `Configured Resend HTTP transporter for user: ${serverConfig.user}`,
          'SendMailService',
        );
        return null;
      }

      const isGmail = serverConfig.host === 'smtp.gmail.com';

      const transportOptions: any = {
        ...(isGmail
          ? { service: 'gmail' }
          : {
              host: serverConfig.host,
              port: serverConfig.port || 587,
              secure: serverConfig.port === 465,
            }),
        auth: {
          user: serverConfig.user,
          pass: serverConfig.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 1000 * 15, // 15 seconds
        socketTimeout: 1000 * 15, // 15 seconds
      };

      Logger.log(
        `Creating mail transporter with config: ${JSON.stringify({
          service: transportOptions.service,
          host: transportOptions.host,
          port: transportOptions.port,
          secure: transportOptions.secure,
          user: transportOptions.auth.user,
        })}`,
        'SendMailService',
      );

      return nodemailer.createTransport(transportOptions);
    });

    if (this.mailConfigs.length === 0) {
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

    if (!this.mailConfigs || this.mailConfigs.length === 0) {
      Logger.error('No mail configurations found.', 'SendMailService');
      throw new Error('No mail configurations found.');
    }

    const maxRetries = this.mailConfigs.length;
    for (let i = 0; i < maxRetries; i++) {
      const currentConfigIndex = this.currentTransporterIndex;
      
      // Advance index for the next call
      this.currentTransporterIndex = (this.currentTransporterIndex + 1) % this.mailConfigs.length;

      const serverConfig = this.mailConfigs[currentConfigIndex];
      const transporter = this.transporters[currentConfigIndex];
      const from = serverConfig.user;

      try {
        if (serverConfig.host === 'smtp.resend.com') {
          Logger.log(`Sending email to ${mailOptions.to} using Resend SDK`, 'SendMailService');
          
          const resend = new Resend(serverConfig.pass);
          const recipients = Array.isArray(mailOptions.to)
            ? (mailOptions.to as string[]).map(t => typeof t === 'string' ? t : (t as any).address)
            : [typeof mailOptions.to === 'string' ? mailOptions.to : (mailOptions.to as any).address];

          const { error } = await resend.emails.send({
            from: `"${this.platformName}" <${from}>`,
            to: recipients,
            subject: mailOptions.subject as string,
            html: mailOptions.html as string,
            text: mailOptions.text as string,
          });

          if (error) {
            throw new Error(`Resend SDK failed to send email: ${error.message} (${error.name})`);
          }
        } else {
          if (!transporter) {
            throw new Error('SMTP Transporter not initialized.');
          }
          await transporter.sendMail({
            ...mailOptions,
            from: `"${this.platformName}" <${from}>`,
          });
        }

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
      `All mail transporters/APIs failed to send email to ${mailOptions.to}`,
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

    const resetUrl = `${this.platformUrl}/auth/reset-password?token=${token}`;

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
}
