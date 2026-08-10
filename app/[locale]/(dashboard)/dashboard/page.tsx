'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, FileText, Clock, Calendar, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockData = {
  kpis: {
    newLeads: { value: 42, change: '+12%', trend: 'up' },
    activeCase: { value: 28, change: '+5%', trend: 'up' },
    revenue: { value: 84500, change: '+18%', trend: 'up' },
    billableHours: { value: 156, change: '+8%', trend: 'up' }
  },
  recentLeads: [
    { id: 1, name: 'John Smith', type: 'Personal Injury', status: 'New', time: '2h' },
    { id: 2, name: 'Sarah Johnson', type: 'Family Law', status: 'Contacted', time: '5h' },
    { id: 3, name: 'Mike Davis', type: 'Criminal Defense', status: 'Qualified', time: '1d' }
  ],
  upcomingDeadlines: [
    { id: 1, case: 'Smith vs. State', task: 'File Motion', due: '2d', priority: 'high' as const },
    { id: 2, case: 'Johnson Divorce', task: 'Discovery Response', due: '5d', priority: 'medium' as const },
    { id: 3, case: 'Davis Settlement', task: 'Client Meeting', due: '1w', priority: 'low' as const }
  ],
  revenueByArea: [
    { area: 'Personal Injury', amount: 35000, percentage: 41 },
    { area: 'Family Law', amount: 28000, percentage: 33 },
    { area: 'Criminal Defense', amount: 15500, percentage: 18 },
    { area: 'Estate Planning', amount: 6000, percentage: 8 }
  ]
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any>(null);
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isEs = locale === 'es';

  useEffect(() => {
    fetch('/api/dashboard/kpi')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.kpi) setKpiData(d.kpi); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const translateType = (type: string) => {
    if (!isEs) return type;
    const types: Record<string, string> = {
      'Personal Injury': 'Lesiones Personales',
      'Family Law': 'Derecho de Familia',
      'Criminal Defense': 'Defensa Penal',
      'Estate Planning': 'Planificación Patrimonial'
    };
    return types[type] || type;
  };

  const translateStatus = (status: string) => {
    if (!isEs) return status;
    const statuses: Record<string, string> = {
      'New': 'Nuevo',
      'Contacted': 'Contactado',
      'Qualified': 'Calificado'
    };
    return statuses[status] || status;
  };

  const translateTask = (task: string) => {
    if (!isEs) return task;
    const tasks: Record<string, string> = {
      'File Motion': 'Presentar Moción',
      'Discovery Response': 'Respuesta a Pruebas',
      'Client Meeting': 'Reunión con Cliente'
    };
    return tasks[task] || task;
  };

  const translatePriority = (priority: string) => {
    if (!isEs) return priority;
    const priorities: Record<string, string> = {
      'high': 'alta',
      'medium': 'media',
      'low': 'baja'
    };
    return priorities[priority] || priority;
  };

  const currency = isEs ? 'CLP' : 'USD';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayKpis = kpiData ? [
    { title: t('kpi.newLeads'), value: String(kpiData.newLeads), icon: Users, change: '', gradient: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
    { title: t('kpi.activeCases'), value: String(kpiData.activeCases), icon: FileText, change: '', gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
    { title: t('kpi.revenue'), value: '-', icon: DollarSign, change: '', gradient: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400' },
    { title: t('kpi.billableHours'), value: '-', icon: Clock, change: '', gradient: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400' },
  ] : [
    { title: t('kpi.newLeads'), value: '42', icon: Users, change: '+12%', gradient: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
    { title: t('kpi.activeCases'), value: '28', icon: FileText, change: '+5%', gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
    { title: t('kpi.revenue'), value: formatCurrency(84500, currency, locale), icon: DollarSign, change: '+18%', gradient: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400' },
    { title: t('kpi.billableHours'), value: '156h', icon: Clock, change: '+8%', gradient: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 font-sans selection:bg-primary/30 selection:text-primary">
      <div>
        <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
        <p className="text-gray-400 mt-2 text-sm">{t('welcome')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="overflow-hidden border border-white/5 bg-[#101010] shadow-xl hover:border-white/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">{kpi.title}</span>
                  <div className={cn('p-2.5 rounded-xl bg-gradient-to-br border border-white/5', kpi.gradient)}>
                    <Icon className={cn('h-4 w-4', kpi.iconColor)} />
                  </div>
                </div>
                <div className="text-3xl font-medium text-white">{kpi.value}</div>
                {kpi.change && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      {t('kpi.fromLastMonth', { change: kpi.change })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg text-white font-medium">{t('recentLeads.title')}</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">{t('recentLeads.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {mockData.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between group">
                  <div className="flex-1">
                    <p className="font-medium text-gray-200 group-hover:text-white transition-colors">{lead.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{translateType(lead.type)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      lead.status === 'New' ? 'bg-primary/10 text-primary border border-primary/20' :
                      lead.status === 'Contacted' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {translateStatus(lead.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1.5">{lead.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/dashboard/leads`} className="w-full mt-6 inline-flex items-center justify-center rounded-xl bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition-colors h-10 px-4">
              {t('recentLeads.title')}
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg text-white font-medium">{t('deadlines.title')}</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">{t('deadlines.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {mockData.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start gap-4 group">
                  <AlertCircle className={`h-5 w-5 mt-0.5 shrink-0 ${
                    deadline.priority === 'high' ? 'text-red-400' :
                    deadline.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-200 group-hover:text-white transition-colors truncate">{translateTask(deadline.task)}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{deadline.case}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-300">{t('deadlines.dueIn', { time: deadline.due })}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider mt-1.5 ${
                      deadline.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      deadline.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {translatePriority(deadline.priority)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/dashboard/tasks`} className="w-full mt-6 inline-flex items-center justify-center rounded-xl bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition-colors h-10 px-4">
              {t('deadlines.title')}
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Breakdown */}
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg text-white font-medium">{t('revenueBreakdown.title')}</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">{t('revenueBreakdown.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {mockData.revenueByArea.map((area, index) => {
                const colors = ['bg-primary', 'bg-blue-400', 'bg-green-400', 'bg-orange-400'];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{translateType(area.area)}</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(area.amount, currency, locale)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[index]} rounded-full`} style={{ width: `${area.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-white/5 bg-[#101010] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="border-b border-white/5 pb-6 relative z-10">
            <CardTitle className="text-lg text-white font-medium">{t('quickActions.title')}</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">{t('quickActions.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-6 relative z-10">
            {[
              { label: t('quickActions.addLead'), icon: Users, href: `/dashboard/leads` },
              { label: t('quickActions.createCase'), icon: FileText, href: `/dashboard/cases` },
              { label: t('quickActions.generateInvoice'), icon: DollarSign, href: `/dashboard/billing` },
              { label: t('quickActions.viewCalendar'), icon: Calendar, href: `/dashboard/tasks` },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href} className="w-full flex items-center font-medium text-sm bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-colors h-12 px-4 rounded-xl">
                  <Icon className="mr-3 h-4 w-4 text-primary" />
                  {action.label}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
