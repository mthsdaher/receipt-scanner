import nodemailer from "nodemailer";
import { env } from "../config/env";

function getTransportConfig() {
  if (!MailService.isConfigured()) {
    return null;
  }

  return {
    host: env.SMTP_HOST as string,
    port: env.SMTP_PORT as number,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER as string,
      pass: env.SMTP_PASS as string,
    },
  };
}

export const MailService = {
  isConfigured(): boolean {
    return Boolean(
      env.SMTP_HOST &&
        env.SMTP_PORT &&
        env.SMTP_USER &&
        env.SMTP_PASS &&
        env.SMTP_FROM
    );
  },

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const transportConfig = getTransportConfig();
    if (!transportConfig) {
      return;
    }

    const transporter = nodemailer.createTransport(transportConfig);
    const resetUrl = `${env.FRONTEND_URL}/reset-password`;

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Reset your Receipt Scanner password",
      text: [
        "You requested a password reset.",
        "",
        `Use this token: ${resetToken}`,
        "",
        `Reset page: ${resetUrl}`,
        "",
        "If you did not request this, ignore this email.",
      ].join("\n"),
      html: `
        <p>You requested a password reset.</p>
        <p><strong>Reset token:</strong> ${resetToken}</p>
        <p>Reset page: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
  },
};
