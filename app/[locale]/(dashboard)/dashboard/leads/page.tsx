'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  User
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  calculateLeadStats,
  filterLeads,
  type DashboardLead,
  type LeadFilter,
} from '@/lib/leads/dashboard';

const statusColors = {
  'new': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'contacted': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  'qualified': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'consultation-scheduled': 'bg-green-500/10 text-green-400 border border-green-500/20',
  'converted': 'bg-green-500/20 text-green-400 border border-green-500/20',
  'lost': 'bg-white/5 text-gray-400 border border-white/10'
};

export default function LeadsPage() {
  const t = useTranslations('leads');
  const locale = useLocale();
  const isEs = locale === 'es';

  const statusLabels: { [key: string]: string } = {
    'new': t('new'),
    'contacted': t('contacted'),
    'qualified': t('qualified'),
    'consultation-scheduled': isEs ? 'Consulta Agendada' : 'Consultation Scheduled',
    'converted': isEs ? 'Convertido' : 'Converted',
    'lost': isEs ? 'Perdido' : 'Lost'
  };

  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leads', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to fetch leads');
      setLeads(Array.isArray(payload.leads) ? payload.leads : []);
    } catch {
      setError(isEs ? 'No se pudieron cargar los leads.' : 'Could not load leads.');
    } finally {
      setIsLoading(false);
    }
  }, [isEs]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const filteredLeads = useMemo(
    () => filterLeads(leads, filter, searchTerm),
    [filter, leads, searchTerm]
  );
  const stats = useMemo(() => calculateLeadStats(leads), [leads]);

  const exportLeads = () => {
    const escapeCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = leads.map((lead) =>
      [lead.name, lead.email, lead.phone, lead.practiceArea, lead.status, lead.score, lead.source]
        .map(escapeCell)
        .join(',')
    );
    const csv = [['name', 'email', 'phone', 'practiceArea', 'status', 'score', 'source'].join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'leads.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
          <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportLeads} disabled={leads.length === 0} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Button asChild>
            <Link href="/dashboard/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('newLead')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('totalLeads')}</CardDescription>
            <CardTitle className="text-3xl text-white">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('newThisWeek')}</CardDescription>
            <CardTitle className="text-3xl text-blue-400">{stats.newThisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('consultationsScheduled')}</CardDescription>
            <CardTitle className="text-3xl text-green-400">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('conversionRate')}</CardDescription>
            <CardTitle className="text-3xl text-purple-400">{stats.conversionRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border border-white/5 bg-[#101010] shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="search"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap lg:ml-auto">
              {(['all', 'new', 'contacted', 'qualified'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter !== f ? 'border-white/10 text-gray-300 hover:bg-white/5' : ''}
                >
                  {t(f)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3 py-4" aria-busy="true" aria-label={isEs ? 'Cargando leads' : 'Loading leads'}>
              {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-white/5" />)}
            </div>
          )}

          {error && !isLoading && (
            <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
              <p>{error}</p>
              <Button onClick={() => void loadLeads()} variant="outline" size="sm" className="mt-4 border-red-500/30">
                {isEs ? 'Reintentar' : 'Retry'}
              </Button>
            </div>
          )}

          {!isLoading && !error && (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col sm:flex-row gap-4 p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
              >
                {/* Lead Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{lead.name}</h3>
                      <p className="text-sm text-gray-400">{lead.practiceArea || (isEs ? 'Sin área' : 'No practice area')}</p>
                    </div>
                  </div>
                  
                  {lead.caseDescription && <p className="text-sm text-gray-300 mb-3">{lead.caseDescription}</p>}
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(locale) : '—'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      <span>{t('score')}: {lead.score ?? 0}/100</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{lead.assignedTo ? (isEs ? 'Asignado' : 'Assigned') : t('unassigned')}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${statusColors[(lead.status ?? 'new') as keyof typeof statusColors]}`}>
                    {statusLabels[lead.status ?? 'new'] || lead.status || statusLabels.new}
                  </span>
                  
                  <div className="mt-auto space-y-2">
                    <Button asChild size="sm" variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5">
                      <a href={`mailto:${lead.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('email')}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {!isLoading && !error && filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('noLeadsFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
