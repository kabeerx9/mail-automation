import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8080'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_SUBJECT: z.string(),
  EMAIL_RATE_LIMIT: z.string().transform(Number).default('50'),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
});

const config = envSchema.parse(process.env);

export default {
  port: config.PORT,

  isDev: config.NODE_ENV === 'development',
  paths: {
    csv: 'recruiters.csv',
    logs: {
      error: 'logs/error.log',
      combined: 'logs/combined.log',
    },
  },
  jwt_secret: config.JWT_SECRET,
  jwt_refresh_secret: config.JWT_REFRESH_SECRET,
};
