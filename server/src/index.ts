import express from 'express';
import { NodemailerService } from './services/email.service';
import { FileCSVService } from './services/csv.service';
import { EmailController } from './controllers/email.controller';
import { createEmailRouter } from './routes/email.routes';
import config from './config';
import logger from './utils/logger';
import { AuthController } from './controllers/auth.controller';
import createAuthRouter from './routes/auth.routes';
import configRoutes from './routes/config.routes';
import cors from 'cors';
import testRoutes from './routes/test.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve static files
// app.use(express.static('public'));

// Health check endpoint
app.get('/health', (_, res) => res.send('OK'));

async function bootstrap() {
  try {
    // Initialize services
    const emailService = new NodemailerService();

    // Initialize email service , which now i won't do because for each user we will have a different configuration
    // await emailService.init();

    const csvService = new FileCSVService();

    // Initialize controller
    const emailController = new EmailController(emailService, csvService);
    const authController = new AuthController();

    // Setup routes
    app.use('/api/emails', createEmailRouter(emailController));
    app.use('/api/auth', createAuthRouter(authController));
    app.use('/api/config', configRoutes);
    app.use('/api/test', testRoutes);

    // Global error handling middleware
    app.use(errorHandler);

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
