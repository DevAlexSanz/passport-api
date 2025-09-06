import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({ path: `.env.${nodeEnv}` });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000').transform(Number),
  TOKEN_SECRET: z.string(),
  CORS_WHITELIST: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()))
    .pipe(z.array(z.string().url())),
  CLOUD_NAME: z.string(),
  API_KEY: z.string(),
  API_SECRET: z.string(),
  GMAIL_USER: z.string(),
  GMAIL_PASSWORD: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  DAVIDA_CLIENT_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(`Environment validation error:`);
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
