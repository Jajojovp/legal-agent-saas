import { z } from 'zod';

const practiceAreaValues = [
  'personal-injury', 'family-law', 'criminal-defense', 'estate-planning',
  'business-law', 'real-estate', 'immigration', 'employment-law',
  'bankruptcy', 'intellectual-property',
] as const;

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  practiceArea: z.enum(practiceAreaValues).optional(),
  caseDescription: z.string().optional(),
  source: z.string().optional(),
  metadata: z.any().optional(),
});

export const leadUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  practiceArea: z.enum(practiceAreaValues).optional(),
  caseDescription: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'consultation-scheduled', 'converted', 'lost']).optional(),
  score: z.number().min(0).max(100).optional(),
  assignedTo: z.number().optional(),
  metadata: z.any().optional(),
});

export const chatbotMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  context: z.object({
    firmName: z.string().optional(),
    practiceAreas: z.array(z.string()).optional(),
    locale: z.enum(['en', 'es']).optional(),
    mode: z.enum(['public', 'internal']).optional(),
  }).optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
