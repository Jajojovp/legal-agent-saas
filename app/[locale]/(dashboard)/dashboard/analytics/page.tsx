'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Target,
  Clock
} from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 45000, cases: 12 },
  { month: 'Feb', revenue: 52000, cases: 14 },
  { month: 'Mar', revenue: 48000, cases: 13 },
  { month: 'Apr', revenue: 61000, cases: 16 },
  { month: 'May', revenue: 55000, cases: 15 },
  { month: 'Jun', revenue: 67000, cases: 18 },
];

const leadFunnel = [
  { stageKey: 'visitors', count: 1250, percentage: 100 },
  { stageKey: 'chatEngaged', count: 450, percentage: 36 },
  { stageKey: 'leadsCaptured', count: 180, percentage: 14.4 },
  { stageKey: 'consultations', count: 72, percentage: 5.8 },
  { stageKey: 'clients', count: 42, percentage: 3.4 },
];

const practiceAreaPerformance = [
  { area: 'Personal Injury', revenue: 185000, cases: 28, avgValue: 6607 },
  { area: 'Family Law', revenue: 142000, cases: 35, avgValue: 4057 },
  { area: 'Criminal Defense', revenue: 98000, cases: 22, avgValue: 4455 },
  { area: 'Estate Planning', revenue: 76000, cases: 41, avgValue: 1854 },
  { area: 'Business Law', revenue: 124000, cases: 18, avgValue: 6889 },
];

const kpiMetrics = [
  { labelKey: 'leadConversion', value: '23.3%', change: '+2.1%', trend: 'up' },
  { labelKey: 'avgCaseValue', value: '$4,892', change: '+8.4%', trend: 'up' },
  { labelKey: 'clientRetention', value: '87%', change: '+3.2%', trend: 'up' },
  { labelKey: 'billableHours', value: '624h', change: '-2.1%', trend: 'down' },
  { labelKey: 'collectionRate', value: '94%', change: '+1.5%', trend: 'up' },
  { labelKey: 'responseTime', value: '2.3h', change: '-0.8h', trend: 'up' },
];

const timeDistribution = [
  { activity: 'Client Meetings', hours: 156, percentage: 25, color: 'bg-blue-500' },
  { activity: 'Document Review', hours: 124, percentage: 20, color: 'bg-green-500' },
  { activity: 'Court Appearances', hours: 93, percentage: 15, color: 'bg-purple-500' },
  { activity: 'Research', hours: 87, percentage: 14, color: 'bg-yellow-500' },
  { activity: 'Administrative', hours: 62, percentage: 10, color: 'bg-orange-500' },
  { activity: 'Other', hours: 102, percentage: 16, color: 'bg-gray-500' },
];

const clientAcquisitionData = [
  { channel: 'Google Ads', cost: 285, clients: 12, cac: 23.75 },
  { channel: 'SEO/Organic', cost: 150, clients: 18, cac: 8.33 },
  { channel: 'Referrals', cost: 0, clients: 24, cac: 0 },
  { channel: 'Social Media', cost: 120, clients: 8, cac: 15 },
  { channel: 'Content Marketing', cost: 200, clients: 14, cac: 14.29 },
];

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const locale = useLocale();
  const isEs = locale === 'es';

  const funnelLabels: Record<string, string> = {
    visitors: t('visitors'),
    chatEngaged: t('chatEngaged'),
    leadsCaptured: t('leadsCaptured'),
    consultations: t('consultations'),
    clients: t('clients'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
        <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="border border-white/5 bg-[#101010] shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">{t(metric.labelKey as keyof typeof t)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                <div className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="border border-white/5 bg-[#101010] shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">{t('revenue')}</CardTitle>
          <CardDescription className="text-gray-400">{t('revenueSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-around gap-4 px-4">
            {revenueData.map((data, index) => {
              const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
              const heightPercent = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-gray-400">
                    ${(data.revenue / 1000).toFixed(0)}k
                  </div>
                  <div 
                    className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-xs text-gray-500">{data.month}</div>
                  <div className="text-xs text-gray-500">{data.cases} {t('cases')}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lead Funnel */}
      <Card className="border border-white/5 bg-[#101010] shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">{t('leadFunnel')}</CardTitle>
          <CardDescription className="text-gray-400">{t('leadFunnelSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadFunnel.map((stage, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{funnelLabels[stage.stageKey]}</span>
                  <span className="text-sm text-gray-400">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium transition-all"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    {stage.percentage >= 10 && `${stage.percentage}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Area Performance */}
      <Card className="border border-white/5 bg-[#101010] shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">{t('practicePerformance')}</CardTitle>
          <CardDescription className="text-gray-400">{t('practicePerformanceSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {practiceAreaPerformance.map((area, index) => (
              <div key={index} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{area.area}</h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${area.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{area.cases} {t('casesLabel')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">{t('avgCaseValueLabel')}</div>
                    <div className="font-medium text-gray-200">${area.avgValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{t('totalCases')}</div>
                    <div className="font-medium text-gray-200">{area.cases}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{t('pctOfRevenue')}</div>
                    <div className="font-medium text-gray-200">
                      {((area.revenue / practiceAreaPerformance.reduce((sum, a) => sum + a.revenue, 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('timeDistribution')}</CardTitle>
            <CardDescription className="text-gray-400">{t('timeDistributionSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{item.activity}</span>
                    <span className="text-sm text-gray-400">{item.hours}h</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('clientAcquisitionCost')}</CardTitle>
            <CardDescription className="text-gray-400">{t('clientAcquisitionCostSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientAcquisitionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                  <div>
                    <div className="font-medium text-gray-200">{item.channel}</div>
                    <div className="text-sm text-gray-400">{item.clients} {t('clients')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${item.cac.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{t('perClient')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
