// Supabase extensions (enable in Supabase SQL Editor):
//   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal, pgEnum, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════
//  ENUMS
// ═══════════════════════════════════════════

export const practiceAreaEnum = pgEnum('practice_area', [
  'personal-injury',
  'family-law',
  'criminal-defense',
  'estate-planning',
  'business-law',
  'real-estate',
  'immigration',
  'employment-law',
  'bankruptcy',
  'intellectual-property'
]);

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'consultation-scheduled',
  'converted',
  'lost'
]);

export const caseStatusEnum = pgEnum('case_status', [
  'intake',
  'active',
  'pending',
  'closed-won',
  'closed-lost'
]);



// ═══════════════════════════════════════════
//  AUTHENTICATION TABLES (NextAuth)
// ═══════════════════════════════════════════

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: text('name').notNull(),
  image: text('image'),
  hashedPassword: text('hashed_password'),
  role: text('role').notNull().default('attorney'),
  phone: text('phone'),
  locale: text('locale').default('en'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  firmIdx: index('users_firm_idx').on(table.firmId),
}));

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// ═══════════════════════════════════════════
//  BUSINESS TABLES
// ═══════════════════════════════════════════

// Law Firms
export const lawFirms = pgTable('law_firms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').default('USA'),
  practiceAreas: text('practice_areas').array(),
  website: text('website'),
  locale: text('locale').default('en'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ═══════════════════════════════════════════
//  SUBSCRIPTIONS & BILLING
// ═══════════════════════════════════════════
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').notNull().references(() => lawFirms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull().default('mercadopago'),
  providerSubscriptionId: text('provider_subscription_id').notNull(),
  planTier: text('plan_tier').notNull(),
  planInterval: text('plan_interval').notNull(),
  currency: text('currency').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  providerStatus: text('provider_status').notNull().default('pending'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  firmUnique: uniqueIndex('subscriptions_firm_unique').on(table.firmId),
  providerIdUnique: uniqueIndex('subscriptions_provider_id_unique').on(table.provider, table.providerSubscriptionId),
  userIdx: index('subscriptions_user_idx').on(table.userId),
}));

export const subscriptionCheckoutAttempts = pgTable('subscription_checkout_attempts', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').notNull().references(() => lawFirms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  providerSubscriptionId: text('provider_subscription_id').notNull(),
  planTier: text('plan_tier').notNull(),
  planInterval: text('plan_interval').notNull(),
  currency: text('currency').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  providerIdUnique: uniqueIndex('subscription_attempts_provider_id_unique').on(table.providerSubscriptionId),
  firmCreatedIdx: index('subscription_attempts_firm_created_idx').on(table.firmId, table.createdAt),
}));

export const paymentEvents = pgTable('payment_events', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').notNull().references(() => lawFirms.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('mercadopago'),
  requestId: text('request_id').notNull(),
  providerEventId: text('provider_event_id').notNull(),
  resourceId: text('resource_id').notNull(),
  eventType: text('event_type').notNull(),
  action: text('action').notNull(),
  payload: jsonb('payload').notNull(),
  processingStatus: text('processing_status').notNull().default('received'),
  errorCode: text('error_code'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  requestUnique: uniqueIndex('payment_events_provider_request_unique').on(table.provider, table.requestId),
  eventUnique: uniqueIndex('payment_events_provider_event_unique').on(table.provider, table.providerEventId),
  resourceIdx: index('payment_events_resource_idx').on(table.resourceId),
  firmIdx: index('payment_events_firm_idx').on(table.firmId),
}));


// ═══════════════════════════════════════════
//  CRM TABLES
// ═══════════════════════════════════════════

// Leads
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  practiceArea: practiceAreaEnum('practice_area'),
  caseDescription: text('case_description'),
  status: leadStatusEnum('status').default('new'),
  source: text('source'),
  score: integer('score').default(0),
  assignedTo: integer('assigned_to').references(() => users.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  firmIdx: index('leads_firm_idx').on(table.firmId),
  statusIdx: index('leads_status_idx').on(table.status),
  assignedIdx: index('leads_assigned_idx').on(table.assignedTo),
}));

// Cases
export const cases = pgTable('cases', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  leadId: integer('lead_id').references(() => leads.id),
  caseNumber: text('case_number').notNull().unique(),
  clientName: text('client_name').notNull(),
  practiceArea: practiceAreaEnum('practice_area'),
  status: caseStatusEnum('status').default('intake'),
  assignedAttorney: integer('assigned_attorney').references(() => users.id),
  description: text('description'),
  courtInfo: jsonb('court_info'),
  importantDates: jsonb('important_dates'),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  firmIdx: index('cases_firm_idx').on(table.firmId),
  statusIdx: index('cases_status_idx').on(table.status),
  attorneyIdx: index('cases_attorney_idx').on(table.assignedAttorney),
}));

// Tasks & Deadlines
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  caseId: integer('case_id').references(() => cases.id),
  title: text('title').notNull(),
  description: text('description'),
  assignedTo: integer('assigned_to').references(() => users.id),
  dueDate: timestamp('due_date'),
  priority: text('priority').default('medium'),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  firmIdx: index('tasks_firm_idx').on(table.firmId),
  assignedIdx: index('tasks_assigned_idx').on(table.assignedTo),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
}));

// Documents
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  caseId: integer('case_id').references(() => cases.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  fileUrl: text('file_url').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id),
  aiAnalysis: jsonb('ai_analysis'),
  createdAt: timestamp('created_at').defaultNow()
});

// Time Entries (for billing)
export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  caseId: integer('case_id').references(() => cases.id),
  userId: integer('user_id').references(() => users.id),
  description: text('description').notNull(),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  date: timestamp('date').notNull(),
  isBillable: boolean('is_billable').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Invoices
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  caseId: integer('case_id').references(() => cases.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  clientName: text('client_name').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  status: text('status').default('draft'), // 'draft', 'sent', 'paid', 'overdue'
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  lineItems: jsonb('line_items'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Chatbot Conversations
export const chatConversations = pgTable('chat_conversations', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  leadId: integer('lead_id').references(() => leads.id),
  sessionId: text('session_id').notNull().unique(),
  locale: text('locale').default('en'),
  messages: jsonb('messages').notNull(),
  outcome: text('outcome'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  firmIdx: index('chat_firm_idx').on(table.firmId),
  sessionIdx: index('chat_session_idx').on(table.sessionId),
}));

// KPI Metrics (Daily snapshots)
export const kpiMetrics = pgTable('kpi_metrics', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  date: timestamp('date').notNull(),
  websiteVisitors: integer('website_visitors').default(0),
  leadsGenerated: integer('leads_generated').default(0),
  consultationsScheduled: integer('consultations_scheduled').default(0),
  newClients: integer('new_clients').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),
  billableHours: decimal('billable_hours', { precision: 8, scale: 2 }).default('0'),
  metrics: jsonb('metrics'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  firmIdx: index('kpi_firm_idx').on(table.firmId),
  dateIdx: index('kpi_date_idx').on(table.date),
}));

// Email Campaign Tracking
export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => lawFirms.id),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  sentTo: integer('sent_to').default(0),
  opened: integer('opened').default(0),
  clicked: integer('clicked').default(0),
  converted: integer('converted').default(0),
  status: text('status').default('draft'), // 'draft', 'scheduled', 'sent'
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow()
});
