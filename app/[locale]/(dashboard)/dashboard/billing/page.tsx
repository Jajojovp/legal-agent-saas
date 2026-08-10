'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Plus,
  DollarSign,
  FileText,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-202404-001',
    clientName: 'John Smith',
    caseNumber: 'CASE-2024-0142',
    totalAmount: 8750,
    paidAmount: 8750,
    status: 'paid',
    dueDate: '2024-04-15',
    paidDate: '2024-04-14',
    lineItems: [
      { description: 'Legal Consultation', hours: 3.5, rate: 350, amount: 1225 },
      { description: 'Document Preparation', hours: 5.0, rate: 350, amount: 1750 },
      { description: 'Court Appearance', hours: 4.0, rate: 450, amount: 1800 },
      { description: 'Research & Analysis', hours: 6.5, rate: 300, amount: 1950 },
      { description: 'Client Communications', hours: 2.5, rate: 250, amount: 625 },
      { description: 'Filing Fees', hours: 0, rate: 0, amount: 1400 }
    ]
  },
  {
    id: 2,
    invoiceNumber: 'INV-202404-002',
    clientName: 'Sarah Johnson',
    caseNumber: 'CASE-2024-0138',
    totalAmount: 5500,
    paidAmount: 2500,
    status: 'sent',
    dueDate: '2024-04-30',
    paidDate: null,
    lineItems: [
      { description: 'Initial Consultation', hours: 2.0, rate: 350, amount: 700 },
      { description: 'Mediation Preparation', hours: 4.0, rate: 350, amount: 1400 },
      { description: 'Document Review', hours: 3.5, rate: 300, amount: 1050 },
      { description: 'Court Filing', hours: 0, rate: 0, amount: 850 },
      { description: 'Client Meetings', hours: 2.5, rate: 350, amount: 875 },
      { description: 'Email Correspondence', hours: 2.0, rate: 250, amount: 500 }
    ]
  },
  {
    id: 3,
    invoiceNumber: 'INV-202404-003',
    clientName: 'Michael Davis',
    caseNumber: 'CASE-2024-0135',
    totalAmount: 3250,
    paidAmount: 0,
    status: 'overdue',
    dueDate: '2024-04-20',
    paidDate: null,
    lineItems: [
      { description: 'Criminal Defense Consultation', hours: 2.0, rate: 400, amount: 800 },
      { description: 'Case Strategy Development', hours: 3.0, rate: 400, amount: 1200 },
      { description: 'Discovery Review', hours: 2.5, rate: 300, amount: 750 },
      { description: 'Court Fees', hours: 0, rate: 0, amount: 500 }
    ]
  },
  {
    id: 4,
    invoiceNumber: 'DRAFT-2024-001',
    clientName: 'Robert Brown',
    caseNumber: 'CASE-2024-0089',
    totalAmount: 4200,
    paidAmount: 0,
    status: 'draft',
    dueDate: null,
    paidDate: null,
    lineItems: [
      { description: 'Business Formation Consultation', hours: 3.0, rate: 350, amount: 1050 },
      { description: 'Operating Agreement Draft', hours: 5.0, rate: 350, amount: 1750 },
      { description: 'Document Filing', hours: 0, rate: 0, amount: 800 },
      { description: 'Follow-up Meeting', hours: 2.0, rate: 300, amount: 600 }
    ]
  }
];

const mockTimeEntries = [
  { id: 1, date: '2024-04-20', attorney: 'Jane Doe', case: 'CASE-2024-0142', description: 'Client phone call re: settlement', hours: 0.5, rate: 350, billable: true },
  { id: 2, date: '2024-04-20', attorney: 'John Attorney', case: 'CASE-2024-0138', description: 'Document review - discovery responses', hours: 2.0, rate: 350, billable: true },
  { id: 3, date: '2024-04-19', attorney: 'Jane Doe', case: 'CASE-2024-0135', description: 'Court appearance - pre-trial', hours: 3.5, rate: 450, billable: true },
  { id: 4, date: '2024-04-19', attorney: 'John Attorney', case: 'CASE-2024-0089', description: 'Draft operating agreement', hours: 4.0, rate: 350, billable: true },
  { id: 5, date: '2024-04-18', attorney: 'Jane Doe', case: 'CASE-2024-0142', description: 'Legal research - tort liability', hours: 2.5, rate: 300, billable: true },
];

const statusIcons = {
  draft: FileText,
  sent: Send,
  paid: CheckCircle,
  overdue: AlertCircle
};

export default function BillingPage() {
  const t = useTranslations('billing');
  const locale = useLocale();
  const isEs = locale === 'es';
  const [activeTab, setActiveTab] = useState<'invoices' | 'time-entries'>('invoices');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusColors = {
    draft: 'bg-white/5 text-gray-400 border border-white/10',
    sent: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
    overdue: 'bg-red-500/10 text-red-400 border border-red-500/20'
  };

  const filteredInvoices = mockInvoices.filter(inv => 
    statusFilter === 'all' || inv.status === statusFilter
  );

  const stats = {
    totalBilled: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalCollected: mockInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    outstanding: mockInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
    overdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
    unbilledHours: mockTimeEntries.reduce((sum, entry) => sum + entry.hours, 0),
    unbilledValue: mockTimeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)
  };

  const formatCurrency = (amount: number) => {
    if (isEs) return `$${amount.toLocaleString('es-CL')}`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
          <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('newInvoice')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('totalBilled')}</CardDescription>
            <CardTitle className="text-2xl text-white">{formatCurrency(stats.totalBilled)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('collected')}</CardDescription>
            <CardTitle className="text-2xl text-green-400">{formatCurrency(stats.totalCollected)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('outstanding')}</CardDescription>
            <CardTitle className="text-2xl text-yellow-400">{formatCurrency(stats.outstanding)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('overdue')}</CardDescription>
            <CardTitle className="text-2xl text-red-400">{formatCurrency(stats.overdue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('unbilledHours')}</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.unbilledHours}h</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('unbilledValue')}</CardDescription>
            <CardTitle className="text-2xl text-white">{formatCurrency(stats.unbilledValue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'invoices'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {t('invoices')}
        </button>
        <button
          onClick={() => setActiveTab('time-entries')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'time-entries'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {t('timeEntries')}
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader>
            <div className="flex gap-2">
              {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                  className={statusFilter !== s ? 'border-white/10 text-gray-300 hover:bg-white/5' : ''}
                >
                  {t(s)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons];
                const collectionRate = (invoice.paidAmount / invoice.totalAmount) * 100;

                return (
                  <div key={invoice.id} className="border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-white">{invoice.invoiceNumber}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {t(invoice.status as 'draft' | 'sent' | 'paid' | 'overdue')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{invoice.clientName}</p>
                        <p className="text-xs text-gray-500">{invoice.caseNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(invoice.totalAmount)}</p>
                        {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                          <p className="text-sm text-green-400">{formatCurrency(invoice.paidAmount)} {t('paidLabel')}</p>
                        )}
                        {invoice.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t('due')}: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-white/5">
                            <th className="pb-2">{t('description')}</th>
                            <th className="pb-2 text-right">{t('hours')}</th>
                            <th className="pb-2 text-right">{t('rate')}</th>
                            <th className="pb-2 text-right">{t('amount')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.lineItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-white/5 last:border-0 text-gray-300">
                              <td className="py-2">{item.description}</td>
                              <td className="py-2 text-right">{item.hours > 0 ? item.hours : '-'}</td>
                              <td className="py-2 text-right">{item.rate > 0 ? `${isEs ? '$' : '$'}${item.rate}` : '-'}</td>
                              <td className="py-2 text-right font-medium text-white">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Progress bar for partial payments */}
                    {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{t('paymentProgress')}</span>
                          <span className="font-medium text-gray-300">{collectionRate.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${collectionRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('viewPdf')}
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          {t('sendToClient')}
                        </Button>
                      )}
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <>
                          <Button size="sm">
                            {t('recordPayment')}
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                            {t('sendReminder')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Entries Tab */}
      {activeTab === 'time-entries' && (
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{t('recentTimeEntries')}</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t('addTimeEntry')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-sm font-medium text-gray-200">{new Date(entry.date).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-400">{entry.attorney}</span>
                      <span className="text-xs text-gray-500">{entry.case}</span>
                    </div>
                    <p className="text-sm text-gray-300">{entry.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-white">{formatCurrency(entry.hours * entry.rate)}</p>
                    <p className="text-xs text-gray-500">{entry.hours}h × ${entry.rate}/h</p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">{isEs ? 'Editar' : 'Edit'}</Button>
                    <Button size="sm">{t('bill')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
