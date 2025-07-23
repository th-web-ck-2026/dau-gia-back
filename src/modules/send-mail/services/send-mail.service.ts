import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import { Bid } from '@/modules/bid/entities/bid.entity';

@Injectable()
export class SendMailService implements OnModuleInit {
  constructor(private readonly mailerService: MailerService) {}
  async onModuleInit() {
    console.log('SEND MAIL');
    await this.sendBidCreate(
      {
        email: 'tung@gmail.com',
        fullname: 'Nguyen Văn Dương',
      } as User,
      {
        bid_price: 100000,
      } as Bid,
      {
        email: 'tungnguyenduong473@gmail.com',
        fullname: 'Nguyen Tùng Dương',
      } as User,
      {
        title: 'Lớp học 1',
      } as Class,
    );
  }
  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './welcome', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.fullname,
        url,
        platformName: 'Cổng gia sư',
        currentYear: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordReset(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      template: './reset-password',
      context: {
        name: user.fullname,
        token,
        platformName: 'Cổng gia sư',
        currentYear: new Date().getFullYear(),
      },
    });
  }
  async sendBidCreate(user: User, bid: Bid, tutor: User, tutorClass: Class) {
    await this.mailerService.sendMail({
      to: tutor.email,
      subject: `Đề xuất giá mới cho lớp học: ${tutorClass.title}`,
      template: './bid-create',
      context: {
        subject: `Đề xuất giá mới cho lớp học: ${tutorClass.title}`,
        tutorName: tutor.fullname,
        studentName: user.fullname,
        classTitle: tutorClass.title,
        bidPrice: bid.bid_price,
        classUrl: `https://conggiasu.com/quan-ly-lop.html`, // URL phải thật cụ thể

        // --- Biến cho Branding & Footer ---
        platformName: 'Cổng gia sư',
        platformUrl: 'https://conggiasu.com',
        platformLogoUrl: 'http://conggiasu.com/assets/img/logo.png', // URL đến logo của bạn
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
