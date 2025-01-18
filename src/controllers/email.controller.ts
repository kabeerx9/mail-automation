import { Request, Response } from 'express';
import { EmailService, CSVService, EmailResponse } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class EmailController {
  constructor(
    private emailService: EmailService,
    private csvService: CSVService
  ) {}

  getStatus = async (req: Request, res: Response) => {
    try {
      const recruiters = await this.csvService.readRecruiters();
      res.json(recruiters);
    } catch (error) {
      logger.error('Failed to get status', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to get status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  sendTestEmail = async (req: Request, res: Response) => {
    try {
      const testEmail = req.body.email || config.smtp.auth.user;
      
      await this.emailService.sendEmail(
        testEmail,
        'Test Email',
        'This is a test email from the email automation system.'
      );

      res.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
      });
    } catch (error) {
      logger.error('Test email failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  processEmails = async (req: Request, res: Response) => {
    const response: EmailResponse = {
      success: false,
      message: '',
      details: {
        sent: 0,
        failed: 0,
        errors: [],
      },
    };

    try {
      const recruiters = await this.csvService.readRecruiters();
      logger.info(`Processing ${recruiters.length} recruiters`);

      for (const recruiter of recruiters) {
        if (recruiter.Status === 'Sent') {
          continue;
        }

        try {
          await this.emailService.sendEmail(
            recruiter.Email,
            config.email.subject,
            this.generateEmailBody(recruiter.Name)
          );

          recruiter.Status = 'Sent';
          recruiter.ReachOutCount += 1;
          recruiter.LastContactDate = new Date().toISOString();
          response.details!.sent++;
        } catch (error) {
          recruiter.Status = 'Failed';
          response.details!.failed++;
          response.details!.errors.push({
            email: recruiter.Email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      await this.csvService.updateRecruiters(recruiters);

      response.success = true;
      response.message = 'Email processing completed';
      res.json(response);
    } catch (error) {
      logger.error('Email processing failed', { error });
      response.message = 'Failed to process emails';
      res.status(500).json(response);
    }
  };

  private generateEmailBody(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Dear ${name},</p>
        <p>I hope this email finds you well.</p>
        <!-- Add your email template here -->
        <p>Best regards,<br>${config.email.from.split('<')[0].trim()}</p>
      </div>
    `;
  }
}
