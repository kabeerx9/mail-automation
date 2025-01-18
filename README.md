# Email Automation Script

This Node.js application automates sending emails based on data from a CSV file. Built with TypeScript, Express, and modern best practices.

## Features

- CSV processing with validation
- Automated email sending with rate limiting
- Detailed logging and error tracking
- TypeScript for better type safety
- RESTful API endpoints
- Environment-based configuration
- Automatic CSV updates after processing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
# Server
PORT=3000
NODE_ENV=development

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Email Settings
EMAIL_FROM="Your Name <your-email@gmail.com>"
EMAIL_SUBJECT="Your Default Subject"
```

3. Create a `recruiters.csv` file in the root directory:
```csv
Name,Email,ReachOutCount,Status,LastContactDate
John Doe,john@example.com,0,Pending,
Jane Smith,jane@example.com,1,Sent,2024-12-20
```

## API Endpoints

- `POST /api/emails/send` - Process and send emails from CSV
- `POST /api/emails/test` - Send a test email
- `GET /api/status` - Get current processing status

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run in production mode
npm start

# Run tests
npm test
```

## CSV Format

The CSV file should have the following columns:
- Name: Recruiter's name
- Email: Valid email address
- ReachOutCount: Number of previous contacts
- Status: Pending/Sent/Failed
- LastContactDate: ISO date string or empty

## Error Handling

The application handles various error scenarios:
- Invalid CSV format
- SMTP configuration issues
- Rate limiting
- Invalid email addresses
- Network issues

## Logging

Logs are written to:
- Console (development)
- `logs/error.log` and `logs/combined.log` (production)
