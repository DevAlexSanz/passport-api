import nodemailer from 'nodemailer';
import ejs from 'ejs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { env } from '@config/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_PASSWORD,
  },
});

interface EmailOptions {
  email: string;
  title?: string;
  description?: string;
  code?: string | number;
  footerText?: string;
}

export const sendEmail = async ({
  email,
  title,
  description,
  code,
  footerText,
}: EmailOptions) => {
  const templatePath = path.join(
    process.cwd(),
    'src/assets/email-template.html'
  );

  const template = fs.readFileSync(templatePath, 'utf-8');

  const html = ejs.render(template, {
    email,
    title,
    description,
    code,
    footerText,
  });

  try {
    const mailOptions = {
      from: env.GMAIL_USER,
      to: email,
      subject: title || 'DaVida Notification',
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
