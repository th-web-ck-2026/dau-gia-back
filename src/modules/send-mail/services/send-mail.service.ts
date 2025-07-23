import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/modules/user/entities/user.entity';
import { Class } from '@/modules/class/entities/class.entity';
import { Bid } from '@/modules/bid/entities/bid.entity';

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './welcome',
      context: {
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
  async sendBidCreate(student: User, bid: Bid, tutor: User, tutorClass: Class) {
    await this.mailerService.sendMail({
      to: tutor.email,
      subject: `Đề xuất giá mới cho lớp học: ${tutorClass.title}`,
      template: './bid-create',
      context: {
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
      },
    });
  }
  async sendTutorSelectBid(
    student: User,
    bid: Bid,
    tutor: User,
    tutorClass: Class,
  ) {
    await this.mailerService.sendMail({
      to: student.email,
      subject: `Đề xuất của bạn cho lớp "${tutorClass.title}" đã được chấp nhận!`,
      template: './tutor-select-bid',
      context: {
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
      },
    });
  }
}
