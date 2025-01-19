import nodemailer from 'nodemailer';
import { EmailService } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class NodemailerService implements EmailService {
  private transporter: nodemailer.Transporter;
  private lastSentTime: number = 0;
  private readonly minDelay: number;

  constructor() {
    this.transporter = nodemailer.createTransport(config.smtp);
    // Convert rate limit from emails per minute to milliseconds between emails
    this.minDelay = (60 * 1000) / config.email.rateLimit;
  }

  async init(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection established successfully');
    } catch (error) {
      logger.error('Failed to establish SMTP connection', { error });
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      // Implement rate limiting
      const now = Date.now();
      const timeSinceLastEmail = now - this.lastSentTime;
      if (timeSinceLastEmail < this.minDelay) {
        await new Promise(resolve =>
          setTimeout(resolve, this.minDelay - timeSinceLastEmail)
        );
      }

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html: body,
      });

      this.lastSentTime = Date.now();
      logger.info('Email sent successfully', { to });
    } catch (error) {
      logger.error('Failed to send email', { to, error });
      throw error;
    }
  }
}
