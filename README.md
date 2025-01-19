# Bulk Email Automation Platform

A full-stack application built with React, Node.js, and PostgreSQL that helps you manage and automate your email campaigns. Whether you're reaching out to recruiters, clients, or managing a marketing campaign, this platform streamlines your email automation needs.

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Email**: SMTP integration
- **Styling**: Tailwind CSS

## Features

- 🔐 User authentication and authorization
- 📧 Bulk email sending with customizable templates
- 📊 Dashboard with email analytics
- 📁 CSV import/export functionality
- ⏱️ Rate limiting and scheduling
- 📝 Email template management
- 🔄 Real-time status updates
- 📈 Campaign tracking and reporting
- ⚙️ SMTP configuration through UI
- 🎨 Responsive modern interface

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bulk-email-automation.git
cd bulk-email-automation
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up your PostgreSQL database and create a `.env` file in the server directory:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=email_automation
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret

# SMTP Configuration (Optional - can be set through UI)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

4. Set up your frontend environment variables in `client/.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Running the Application

### Development Mode

```bash
# Run backend
cd server
npm run dev

# Run frontend (in a new terminal)
cd client
npm start
```

### Production Mode

```bash
# Build and run backend
cd server
npm run build
npm start

# Build frontend
cd client
npm run build
```

## Usage

1. Register/Login to your account
2. Configure your SMTP settings (if not set in .env)
3. Upload your CSV file with contact information
4. Create or select an email template
5. Preview and send your emails
6. Monitor delivery status and analytics

## CSV Format

Your CSV file should include these columns:
- Name: Recipient's name
- Email: Valid email address
- Custom fields (optional): Any additional personalization data

## Security Features

- Encrypted password storage
- JWT-based authentication
- Rate limiting
- SMTP credential encryption
- Input sanitization
- XSS protection

## API Documentation

Access the API documentation at `/api/docs` when running the server locally.

Key endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/emails/send` - Process and send emails
- `GET /api/campaigns` - Get campaign statistics
- `POST /api/smtp/config` - Update SMTP settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
