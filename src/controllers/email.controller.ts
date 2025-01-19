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
          if (recruiter.ReachOutCount === 0) {
            await this.emailService.sendEmail(
              recruiter.Email,
              config.email.subject,
              this.generateEmailBody(recruiter.Name , recruiter.Company , recruiter.Role)
            );
          } else {
            await this.emailService.sendEmail(
              recruiter.Email,
              config.email.subject,
              this.generateFollowUpEmailBody(recruiter.Name , recruiter.Company , recruiter.Role)
            );
          }

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

  // This function generates an email body
  private generateEmailBody(name: string, company: string, role: string): string {
    const resumeLink = "https://drive.google.com/file/d/1A1ePohlTOyB4i3qXLjvrcqTjPeEpUYsD/view?usp=drive_link"
    const githubLink = "https://github.com/kabeerx9"
    const email = "kabeer786joshi@gmail.com"
    const phone = "+91 9412120120"
    const address = "Dehradun, Uttarakhand"

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333;">
        <p>Dear ${name},</p>
        <p>
          I hope this message finds you well. My name is ${
            config.email.from.split('<')[0].trim()
          }, and I came across the opening for the <strong>${role}</strong> role at <strong>${company}</strong>.
          I am genuinely excited about this opportunity as it aligns closely with my skills and career aspirations.
        </p>
        <p>
            I have close to two years of professional experience as a frontend developer. During this time, I have developed dynamic applications using modern frameworks like React, Next.js, and React Native.
          I’ve also worked on optimizing applications for performance, implementing CI/CD pipelines, and deploying production-ready systems, ensuring reliability and scalability.
        </p>
        <p>
          Some of my notable contributions include building a comprehensive school management system, creating native mobile apps for students and teachers, and developing a real-time collaborative code editor. I am always driven to learn and contribute meaningfully to a team’s success.
        </p>
        <p>
          I would love the opportunity to discuss how my expertise aligns with your team’s goals and how I can add value to ${company}.
          Please find my resume attached <a href="${resumeLink}" target="_blank" style="color: #007BFF; text-decoration: none;">here</a>.
        </p>
        <p>
          Thank you for considering my application. I look forward to hearing from you.
        </p>
        <p>
          Best regards,<br>
          ${config.email.from.split('<')[0].trim()}<br>
          ${address}<br>
          <a href="mailto:${email}" style="color: #007BFF; text-decoration: none;">${email}</a> | ${phone} |
          <a href="${githubLink}" target="_blank" style="color: #007BFF; text-decoration: none;">GitHub</a>
        </p>
      </div>
    `;
  }
  private generateFollowUpEmailBody(recruiterName: string, recruiterCompany: string, role: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <p>Dear ${recruiterName},</p>
        <p>
          I hope this message finds you well. I wanted to follow up on my previous email regarding the <strong>${role}</strong> position at <strong>${recruiterCompany}</strong>.
          I am very excited about the opportunity to contribute to your team and am eager to learn more about this role and how I could potentially add value to ${recruiterCompany}.
        </p>
        <p>
          I completely understand that you might have a busy schedule. If there's a convenient time to discuss this opportunity or if further information is required,
          I’d be happy to provide it.
        </p>
        <p>
          Thank you for your time and consideration. I look forward to hearing from you and am hopeful for the chance to connect.
        </p>
        <p>
          Best regards,<br>
          ${config.email.from.split('<')[0].trim()}
        </p>
      </div>
    `;
  }
}
