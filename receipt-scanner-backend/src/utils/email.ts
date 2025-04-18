import nodemailer from "nodemailer";
import 'dotenv/config';

console.log('▶ SMTP_HOST:', process.env.SMTP_HOST);
console.log('▶ SMTP_PORT:', process.env.SMTP_PORT);
console.log('▶ SMTP_EMAIL:', process.env.SMTP_EMAIL);
console.log('▶ SMTP_PASSWORD:', process.env.SMTP_PASSWORD?.replace(/.(?=.{4})/g, '*'));
console.log('▶ EMAIL_FROM:', process.env.EMAIL_FROM);

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  logger: true, 
  debug: true,   
});

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP verify failed:', err);
  } else {
    console.log('✅ SMTP server is ready to send messages');
  }
});

export const sendVerificationEmail = async (to: string, code: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your verification code",
    html: `
      <p>Hi!</p>
      <p>Your verification code is: <b>${code}</b></p>
      <p>5 minutes to expire.</p>
    `,
  });
};
