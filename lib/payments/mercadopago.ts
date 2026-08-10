import { z } from 'zod';
import type { CheckoutRequest } from './contracts';
import { buildExternalReference } from './contracts';

const MP_API_BASE = 'https://api.mercadopago.com';

export interface MPPlanConfig {
  planId: string;
  price: number;
  currency: string;
}

export const MP_PLANS: Record<string, { monthly: MPPlanConfig; yearly: MPPlanConfig }> = {
  starter: {
    monthly: { planId: process.env.MP_PLAN_STARTER_MONTHLY || '', price: 49990, currency: 'CLP' },
    yearly: { planId: process.env.MP_PLAN_STARTER_YEARLY || '', price: 39990, currency: 'CLP' },
  },
  professional: {
    monthly: { planId: process.env.MP_PLAN_PROFESSIONAL_MONTHLY || '', price: 99990, currency: 'CLP' },
    yearly: { planId: process.env.MP_PLAN_PROFESSIONAL_YEARLY || '', price: 84990, currency: 'CLP' },
  },
  firm: {
    monthly: { planId: process.env.MP_PLAN_FIRM_MONTHLY || '', price: 199990, currency: 'CLP' },
    yearly: { planId: process.env.MP_PLAN_FIRM_YEARLY || '', price: 169990, currency: 'CLP' },
  },
};

export const MP_PLANS_USD: Record<string, { monthly: MPPlanConfig; yearly: MPPlanConfig }> = {
  starter: {
    monthly: { planId: process.env.MP_PLAN_STARTER_MONTHLY_USD || '', price: 49, currency: 'USD' },
    yearly: { planId: process.env.MP_PLAN_STARTER_YEARLY_USD || '', price: 39, currency: 'USD' },
  },
  professional: {
    monthly: { planId: process.env.MP_PLAN_PROFESSIONAL_MONTHLY_USD || '', price: 99, currency: 'USD' },
    yearly: { planId: process.env.MP_PLAN_PROFESSIONAL_YEARLY_USD || '', price: 79, currency: 'USD' },
  },
  firm: {
    monthly: { planId: process.env.MP_PLAN_FIRM_MONTHLY_USD || '', price: 199, currency: 'USD' },
    yearly: { planId: process.env.MP_PLAN_FIRM_YEARLY_USD || '', price: 159, currency: 'USD' },
  },
};

export type PlanTier = keyof typeof MP_PLANS;
export type PlanInterval = 'monthly' | 'yearly';

export function getPlanConfig(input: CheckoutRequest): MPPlanConfig {
  const plans = input.currency === 'USD' ? MP_PLANS_USD : MP_PLANS;
  const config = plans[input.planTier][input.planInterval];
  if (!config.planId) throw new Error('PaymentPlanNotConfigured');
  return config;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
  };
}

export async function createMPSubscription(params: {
  planTier: string;
  planInterval: string;
  userEmail: string;
  userId: string;
  firmId: string;
  amount: number;
  currency?: string;
}) {
  const frequency = params.planInterval === 'yearly' ? 12 : 1;
  const frequencyType = params.planInterval === 'yearly' ? 'months' : 'months';

  const response = await fetch(`${MP_API_BASE}/preapproval`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      reason: `LegalAgent - Plan ${params.planTier}`,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: params.amount,
        currency_id: params.currency || 'CLP',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      payer_email: params.userEmail,
      external_reference: buildExternalReference({
        userId: Number(params.userId), firmId: Number(params.firmId),
        planTier: params.planTier as CheckoutRequest['planTier'],
        planInterval: params.planInterval as CheckoutRequest['planInterval'],
        currency: (params.currency || 'CLP') as CheckoutRequest['currency'],
      }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('MP subscription error:', error);
    throw new Error('Failed to create MercadoPago subscription');
  }

  const data = await response.json();
  return { initPoint: data.init_point, subscriptionId: data.id };
}

export async function getMPSubscription(subscriptionId: string) {
  const response = await fetch(`${MP_API_BASE}/preapproval/${subscriptionId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch MP subscription');
  return mpSubscriptionSchema.parse(await response.json());
}

export async function cancelMPSubscription(subscriptionId: string) {
  const response = await fetch(`${MP_API_BASE}/preapproval/${subscriptionId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!response.ok) throw new Error('Failed to cancel MP subscription');
  return response.json();
}

export async function verifyMPWebhook(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): Promise<boolean> {
  if (!xSignature || !xRequestId) return false;
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts: Record<string, string> = {};
  xSignature.split(',').forEach(part => {
    const [key, value] = part.trim().split('=');
    parts[key] = value;
  });

  if (!parts.ts || !/^[a-fA-F0-9]{64}$/.test(parts.v1 || '')) return false;
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
  const computedHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  const expected = encoder.encode(computedHex.toLowerCase());
  const received = encoder.encode(parts.v1.toLowerCase());
  if (expected.byteLength !== received.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected[index] ^ received[index];
  }
  return difference === 0;
}

const mpSubscriptionSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  external_reference: z.string().min(1),
  auto_recurring: z.object({
    transaction_amount: z.number().nonnegative(),
    currency_id: z.string().min(1),
  }).passthrough(),
  date_created: z.string().optional(),
  last_modified: z.string().optional(),
  next_payment_date: z.string().nullable().optional(),
}).passthrough();
