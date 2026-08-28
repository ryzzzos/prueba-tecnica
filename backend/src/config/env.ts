import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('8000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URI (e.g. postgresql://user:pass@host:5432/db)'),
  CORS_ORIGIN: z.string().default('*'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('[FATAL] Invalid or missing required environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  - [${issue.path.join('.')}]: ${issue.message}`);
    });
    console.error('\n[INFO] Please check your .env file or refer to .env.example\n');
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
