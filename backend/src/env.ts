import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  JWT_SECRET: z.string().min(8).default("dev-super-secret"),
  DATABASE_URL: z.string().url().optional()
});

export const env = envSchema.parse(process.env);
