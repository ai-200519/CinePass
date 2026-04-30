import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailProvider {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailProvider.name);
  
  constructor(private readonly config: ConfigService) {
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      service: 'gmail',
      auth: {
        user: this.config.get('GMAIL_USER'),
        pass: this.config.get('GMAIL_APP_PASSWORD'),
      },
    });
  }

  // email.provider.ts — sendOtp method
  async sendOtp(email: string, nom: string, otp: string): Promise<void> {

    this.transporter.sendMail({
      to: email,
      from: `"CinePass" <${this.config.get('GMAIL_USER')}>`,
      subject: '🎬 CinePass — Votre code de réinitialisation',
      html: `
            <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
            <div style="background: #D72638; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🎬 CinePass</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2>Bonjour ${nom},</h2>
                <p>Voici votre code de réinitialisation :</p>
                <div style="text-align: center; margin: 30px 0;">
                <div style="background: #1C1C1C; color: #D72638; font-size: 42px;
                            font-weight: bold; letter-spacing: 16px; padding: 20px;
                            border-radius: 8px; font-family: monospace;">
                    ${otp}
                </div>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center;">
                ⏱️ Ce code expire dans <strong>10 minutes</strong>.
                </p>
                <p style="color: #666; font-size: 14px;">
                Si vous n'avez pas fait cette demande, ignorez cet email.
                </p>
            </div>
            </div>
        `,
    }, (error, info) => {
      if (error) {
        this.logger.error(`❌ Failed to send OTP email to ${email}`, error);
      } else {
        this.logger.log(`✅ OTP email sent to ${email}: ${info.response}`);
      }
    });
  }
}
