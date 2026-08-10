import { describe, expect, it } from 'vitest';
import { calculateLeadStats, filterLeads, type DashboardLead } from '@/lib/leads/dashboard';

const leads: DashboardLead[] = [
  {
    id: 1,
    name: 'Ana Pérez',
    email: 'ana@example.com',
    phone: null,
    practiceArea: 'family-law',
    caseDescription: 'Custody consultation',
    status: 'new',
    score: 80,
    source: 'website',
    createdAt: '2026-08-08T12:00:00.000Z',
    assignedTo: 7,
  },
  {
    id: 2,
    name: 'Luis Soto',
    email: 'luis@example.com',
    phone: null,
    practiceArea: 'business-law',
    caseDescription: null,
    status: 'converted',
    score: 60,
    source: 'referral',
    createdAt: '2026-07-01T12:00:00.000Z',
    assignedTo: 7,
  },
];

describe('leads dashboard model', () => {
  it('filters safely when optional fields are null', () => {
    expect(filterLeads(leads, 'all', 'business')).toEqual([leads[1]]);
    expect(filterLeads(leads, 'new', 'ANA')).toEqual([leads[0]]);
  });

  it('derives truthful stats from API data', () => {
    expect(calculateLeadStats(leads, new Date('2026-08-10T12:00:00.000Z'))).toEqual({
      total: 2,
      newThisWeek: 1,
      scheduled: 0,
      conversionRate: 50,
      avgScore: 70,
    });
  });

  it('returns zeroes for an empty tenant', () => {
    expect(calculateLeadStats([], new Date('2026-08-10T12:00:00.000Z'))).toEqual({
      total: 0,
      newThisWeek: 0,
      scheduled: 0,
      conversionRate: 0,
      avgScore: 0,
    });
  });
});
