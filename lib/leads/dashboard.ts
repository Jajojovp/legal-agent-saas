export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'consultation-scheduled'
  | 'converted'
  | 'lost';

export interface DashboardLead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  practiceArea: string | null;
  caseDescription: string | null;
  status: LeadStatus | null;
  score: number | null;
  source: string | null;
  createdAt: string | Date | null;
  assignedTo: number | null;
}

export type LeadFilter = 'all' | 'new' | 'contacted' | 'qualified';

export function filterLeads(
  leads: DashboardLead[],
  filter: LeadFilter,
  searchTerm: string
): DashboardLead[] {
  const query = searchTerm.trim().toLocaleLowerCase();

  return leads.filter((lead) => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const searchable = [lead.name, lead.email, lead.practiceArea]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLocaleLowerCase();

    return matchesFilter && searchable.includes(query);
  });
}

export function calculateLeadStats(leads: DashboardLead[], now = new Date()) {
  if (leads.length === 0) {
    return { total: 0, newThisWeek: 0, scheduled: 0, conversionRate: 0, avgScore: 0 };
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = leads.filter((lead) => {
    if (lead.status !== 'new' || !lead.createdAt) return false;
    const createdAt = new Date(lead.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= weekAgo && createdAt <= now;
  }).length;
  const converted = leads.filter((lead) => lead.status === 'converted').length;
  const scoreTotal = leads.reduce((sum, lead) => sum + (lead.score ?? 0), 0);

  return {
    total: leads.length,
    newThisWeek,
    scheduled: leads.filter((lead) => lead.status === 'consultation-scheduled').length,
    conversionRate: Math.round((converted / leads.length) * 100),
    avgScore: Math.round(scoreTotal / leads.length),
  };
}
