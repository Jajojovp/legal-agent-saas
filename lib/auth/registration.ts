import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(100),
  firmName: z.string().trim().min(1).max(200),
});

