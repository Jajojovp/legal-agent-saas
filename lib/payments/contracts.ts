import { z } from 'zod';

export const planTierSchema = z.enum(['starter', 'professional', 'firm']);
export const planIntervalSchema = z.enum(['monthly', 'yearly']);
export const currencySchema = z.enum(['CLP', 'USD']);

export const checkoutRequestSchema = z.object({
  planTier: planTierSchema,
  planInterval: planIntervalSchema,
  currency: currencySchema,
}).strict();

export const mercadoPagoWebhookSchema = z.object({
  id: z.number().int().nonnegative(),
  live_mode: z.boolean(),
  type: z.literal('subscription_preapproval'),
  action: z.string().min(1).max(100),
  date_created: z.string().datetime({ offset: true }),
  user_id: z.union([z.number().int(), z.string()]).optional(),
  api_version: z.string().max(20).optional(),
  application_id: z.union([z.number().int(), z.string()]).optional(),
  data: z.object({ id: z.union([z.string().min(1).max(200), z.number().int().nonnegative()]) }).strict(),
}).strict();

const externalReferenceSchema = z.object({
  user_id: z.number().int().positive(),
  firm_id: z.number().int().positive(),
  plan_tier: planTierSchema,
  plan_interval: planIntervalSchema,
  currency: currencySchema,
}).strict().transform((value) => ({
  userId: value.user_id,
  firmId: value.firm_id,
  planTier: value.plan_tier,
  planInterval: value.plan_interval,
  currency: value.currency,
}));

type ExternalReference = z.input<typeof externalReferenceSchema>;

export function buildExternalReference(value: {
  userId: number; firmId: number;
  planTier: z.infer<typeof planTierSchema>;
  planInterval: z.infer<typeof planIntervalSchema>;
  currency: z.infer<typeof currencySchema>;
}): string {
  const raw: ExternalReference = {
    user_id: value.userId, firm_id: value.firmId, plan_tier: value.planTier,
    plan_interval: value.planInterval, currency: value.currency,
  };
  externalReferenceSchema.parse(raw);
  return JSON.stringify(raw);
}

export function parseExternalReference(value: unknown) {
  if (typeof value !== 'string' || value.length > 1000) throw new Error('Invalid external reference');
  try {
    return externalReferenceSchema.parse(JSON.parse(value));
  } catch {
    throw new Error('Invalid external reference');
  }
}

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
