import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({path: `.env.${nodeEnv}`});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(`Environment validation error:`);
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
