import nodemailer from 'nodemailer';
import { EmailService } from '../types';
import logger from '../utils/logger';
import { Configuration } from '@prisma/client';
export class NodemailerService implements EmailService {


    private lastSentTime: number = 0;


  async sendEmail(to: string, body: string , transporter: nodemailer.Transporter , configuration : Configuration ): Promise<void> {
    try {
      // Implement rate limiting
      const now = Date.now();
      const timeSinceLastEmail = now - this.lastSentTime;
      if (timeSinceLastEmail < configuration.EMAIL_RATE_LIMIT) {
        await new Promise(resolve =>
          setTimeout(resolve, configuration.EMAIL_RATE_LIMIT - timeSinceLastEmail)
        );
      }

      await transporter.sendMail({
        from: configuration.EMAIL_FROM,
        to,
        subject : configuration.EMAIL_SUBJECT,
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
