import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class EmailProvider {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(EmailProvider.name);

  constructor(private readonly config: ConfigService) {
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailAppPassword = this.config.get<string>('GMAIL_APP_PASSWORD');
    const nodeEnv = this.config.get<string>('NODE_ENV') || 'development';

    if (!gmailUser || !gmailAppPassword) {
      this.logger.warn(
        'Email transport is not configured (missing GMAIL_USER / GMAIL_APP_PASSWORD). ' +
          (nodeEnv === 'production'
            ? 'OTP emails will fail in production.'
            : 'In development, OTP will be logged in the backend console.'),
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  // email.provider.ts — sendOtp method
  // ── Generate OTP email HTML ───────────────────────────────────────────────
  private buildOtpHtml(
    nom: string,
    otp: string,
    expiresAt: Date,
    purpose: 'register' | 'reset_password',
  ): string {
    const expiryTime = expiresAt.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const content = {
      register: {
        title: 'Confirmer votre inscription',
        subtitle: 'Entrez ce code pour activer votre compte CinePass.',
      },
      reset_password: {
        title: 'Réinitialiser votre mot de passe',
        subtitle: 'Entrez ce code pour créer un nouveau mot de passe.',
      },
    }[purpose];

    // OTP digits with spaces for readability
    const otpSpaced = otp.split('').join(' ');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; }
    .wrapper        { background-color: #F3F4F6; }
    .card           { background-color: #FFFFFF; }
    .text-primary   { color: #1F1F1F; }
    .text-secondary { color: #6B7280; }
    .otp-box        { background-color: #1C1C1C; }
    .otp-digits     { color: #D72638; }
    .footer-bg      { background-color: #1C1C1C; }
    .footer-text    { color: #9CA3AF; }
    .logo-light     { display: block !important; }
    .logo-dark      { display: none !important; }

    @media (prefers-color-scheme: dark) {
      .wrapper        { background-color: #0B0B0B !important; }
      .card           { background-color: #1C1C1C !important; }
      .text-primary   { color: #F9FAFB !important; }
      .text-secondary { color: #9CA3AF !important; }
      .otp-box        { background-color: #0B0B0B !important; }
      .footer-bg      { background-color: #0B0B0B !important; }
      .logo-light     { display: none !important; }
      .logo-dark      { display: block !important; }
    }
  </style>
</head>
<body>
<table class="wrapper" width="100%" cellpadding="0" cellspacing="0"
       style="background-color: #F3F4F6; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table class="card" width="600" cellpadding="0" cellspacing="0"
             style="background-color: #FFFFFF; border-radius: 12px;
                    overflow: hidden; max-width: 600px; width: 100%;">

        <!-- Header with logo -->
        <tr>
          <td style="background-color: #ec5766; padding: 28px 40px; text-align: center;">
            <!--[if !mso]><!-->
            <!-- Light mode logo — replace src with your actual hosted logo URL -->
            <img class="logo-light"
                 src="cid:logo-light"
                 alt="CinePass"
                 width="160"
                 style="display: block; margin: 0 auto; height: auto; max-height: 60px;">

            <!-- Dark mode logo — replace src with your actual hosted logo URL -->
            <img class="logo-dark"
                 src="cid:logo-dark"
                 alt="CinePass"
                 width="160"
                 style="display: none; margin: 0 auto; height: auto; max-height: 60px;">
            <!--<![endif]-->

          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 40px;">
            <h1 class="text-primary"
                style="font-size: 22px; font-weight: 700; color: #1F1F1F; margin-bottom: 8px;">
              ${content.title}
            </h1>
            <p class="text-secondary"
               style="font-size: 15px; color: #6B7280; margin-bottom: 24px; line-height: 1.6;">
              Bonjour <strong style="color: #1F1F1F;">${nom}</strong>,
              <br>${content.subtitle}
            </p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin-bottom: 28px;">

            <p style="font-size: 13px; color: #6B7280; text-align: center;
                      margin-bottom: 12px; text-transform: uppercase;
                      letter-spacing: 2px; font-weight: 600;">
              Votre code de vérification
            </p>

            <!-- OTP box -->
            <table class="otp-box" width="100%" cellpadding="0" cellspacing="0"
                   style="background-color: #1C1C1C; border-radius: 10px; margin-bottom: 16px;">
              <tr>
                <td style="padding: 28px; text-align: center;">
                  <span class="otp-digits"
                        style="font-family: 'Courier New', monospace;
                               font-size: 48px; font-weight: 900;
                               color: #D72638; letter-spacing: 18px;
                               display: inline-block; padding-left: 18px;">
                    ${otpSpaced}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Expiry -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background-color: #FEF3C7; border-radius: 8px;
                          border-left: 4px solid #F59E0B; margin-bottom: 28px;">
              <tr>
                <td style="padding: 14px 18px;">
                  <p style="font-size: 14px; color: #92400E; margin: 0;">
                    ⏱️ Ce code expire à <strong>${expiryTime}</strong>
                    &nbsp;·&nbsp; Valable <strong>10 minutes</strong> uniquement
                  </p>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin-bottom: 24px;">

            <!-- Security note -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background-color: #EFF6FF; border-radius: 8px;
                          border-left: 4px solid #3B82F6; margin-bottom: 24px;">
              <tr>
                <td style="padding: 14px 18px;">
                  <p style="font-size: 13px; color: #1E40AF; margin: 0; line-height: 1.6;">
                    🔒 <strong>Sécurité :</strong> Ne partagez jamais ce code.
                    CinePass ne vous le demandera jamais par téléphone.
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #9CA3AF; text-align: center; line-height: 1.6;">
              Vous n'avez pas fait cette demande ?
              <br>Ignorez cet email — votre compte reste sécurisé.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer-bg"
              style="background-color: #1C1C1C; padding: 24px 40px; text-align: center;">
            <p class="footer-text"
               style="font-size: 12px; color: #9CA3AF; margin-bottom: 4px;">
              © 2026 CinePass · Tous droits réservés
            </p>
            <p class="footer-text" style="font-size: 12px; color: #6B7280;">
              Email automatique — merci de ne pas répondre.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
  }

  // ── Send OTP email ────────────────────────────────────────────────────────
  async sendOtp(
    email: string,
    nom: string,
    otp: string,
    expiresAt: Date,
    purpose: 'register' | 'reset_password',
  ): Promise<void> {
    const nodeEnv = this.config.get<string>('NODE_ENV') || 'development';

    // If email is not configured, fall back to backend console in non-production.
    if (!this.transporter) {
      if (nodeEnv === 'production') {
        throw new Error(
          'Email transport is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.',
        );
      }

      this.logger.warn(
        `[DEV ONLY] OTP for ${email} (purpose=${purpose}) = ${otp} (expiresAt=${expiresAt.toISOString()})`,
      );
      return;
    }

    const subjects = {
      register: '🎬 CinePass — Confirmez votre email',
      reset_password: '🎬 CinePass — Réinitialisation de mot de passe',
    };

    // Attach logo files as CID (inline images)
    const logoLightPath = path.join(process.cwd(), 'assets', 'logo-light.png');
    const logoDarkPath = path.join(process.cwd(), 'assets', 'logo-dark.png');

    const attachments = [];

    // Only attach if files exist
    if (fs.existsSync(logoLightPath)) {
      attachments.push({
        filename: 'logo-light.png',
        path: logoLightPath,
        cid: 'logo-light', // ← referenced as src="cid:logo-light"
        contentDisposition: 'inline',
      });
    }

    if (fs.existsSync(logoDarkPath)) {
      attachments.push({
        filename: 'logo-dark.png',
        path: logoDarkPath,
        cid: 'logo-dark', // ← referenced as src="cid:logo-dark"
        contentDisposition: 'inline',
      });
    }

    try {
      await this.transporter.sendMail({
        from: `"CinePass" <${this.config.get('GMAIL_USER')}>`,
        to: email,
        subject: subjects[purpose],
        html: this.buildOtpHtml(nom, otp, expiresAt, purpose),
        attachments,
      });

      this.logger.log(`✅ OTP email sent to ${email} — purpose: ${purpose}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send OTP email to ${email} — purpose: ${purpose}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (nodeEnv !== 'production') {
        this.logger.warn(
          `[DEV ONLY] OTP for ${email} (purpose=${purpose}) = ${otp} (expiresAt=${expiresAt.toISOString()})`,
        );
        return;
      }

      throw error;
    }
  }
}
