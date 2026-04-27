const nodemailer = require('nodemailer');
require('dotenv').config();

class MailService {
  constructor() {
    this.transporter = null;
    this.provider = process.env.EMAIL_PROVIDER || 'mailersend';
  }

  // Initialize transporter on each call to ensure .env changes (if any) are picked up, 
  // or initialize once if you prefer. Here we initialize once but provide a way to switch.
  initTransporter() {
    const provider = process.env.EMAIL_PROVIDER || 'mailersend';
    
    if (provider === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    } else {
      // Default: MailerSend or Generic SMTP
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendMail({ to, subject, html, text }) {
    try {
      const transporter = this.initTransporter();
      const provider = process.env.EMAIL_PROVIDER || 'mailersend';
      
      const fromEmail = provider === 'gmail' ? process.env.GMAIL_USER : process.env.MAIL_FROM;

      const info = await transporter.sendMail({
        from: `"2BI Planejamento" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`Email sent via ${provider}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`MailService Error (${process.env.EMAIL_PROVIDER}):`, error);
      throw error;
    }
  }
}

module.exports = new MailService();
