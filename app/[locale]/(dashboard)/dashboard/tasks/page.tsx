'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const mockTasks = [
  {
    id: 1,
    title: 'File Motion to Compel Discovery',
    caseNumber: 'CASE-2024-0142',
    clientName: 'John Smith',
    dueDate: '2024-04-25T09:00:00Z',
    priority: 'high',
    assignedTo: 'Jane Doe',
    isCompleted: false,
    description: 'Opposing counsel has not responded to discovery requests within statutory deadline'
  },
  {
    id: 2,
    title: 'Custody Mediation Session',
    caseNumber: 'CASE-2024-0138',
    clientName: 'Sarah Johnson',
    dueDate: '2024-04-22T10:00:00Z',
    priority: 'high',
    assignedTo: 'John Attorney',
    isCompleted: false,
    description: 'Court-ordered mediation at Family Services Center'
  },
  {
    id: 3,
    title: 'Pre-trial Hearing',
    caseNumber: 'CASE-2024-0135',
    clientName: 'Michael Davis',
    dueDate: '2024-04-30T13:00:00Z',
    priority: 'urgent',
    assignedTo: 'Jane Doe',
    isCompleted: false,
    description: 'Criminal Court Division 3, Judge Thompson presiding'
  },
  {
    id: 4,
    title: 'Draft Settlement Agreement',
    caseNumber: 'CASE-2024-0142',
    clientName: 'John Smith',
    dueDate: '2024-04-28T17:00:00Z',
    priority: 'medium',
    assignedTo: 'Jane Doe',
    isCompleted: false,
    description: 'Initial draft based on negotiation terms from mediation'
  },
  {
    id: 5,
    title: 'Client Meeting - Estate Review',
    caseNumber: 'CASE-2024-0101',
    clientName: 'Emily Williams',
    dueDate: '2024-04-21T14:00:00Z',
    priority: 'low',
    assignedTo: 'John Attorney',
    isCompleted: false,
    description: 'Annual review of estate plan documents'
  },
  {
    id: 6,
    title: 'File Articles of Incorporation',
    caseNumber: 'CASE-2024-0089',
    clientName: 'Robert Brown',
    dueDate: '2024-04-26T17:00:00Z',
    priority: 'medium',
    assignedTo: 'Jane Doe',
    isCompleted: false,
    description: 'Submit LLC formation documents to Secretary of State'
  },
  {
    id: 7,
    title: 'Discovery Response Submission',
    caseNumber: 'CASE-2024-0138',
    clientName: 'Sarah Johnson',
    dueDate: '2024-04-18T17:00:00Z',
    priority: 'urgent',
    assignedTo: 'John Attorney',
    isCompleted: true,
    description: 'Completed and filed with court clerk'
  }
];

const priorityColors = {
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border border-green-500/20'
};

const priorityIcons = {
  urgent: AlertCircle,
  high: AlertCircle,
  medium: Clock,
  low: Clock
};

export default function TasksPage() {
  const t = useTranslations('tasks');
  const locale = useLocale();
  const isEs = locale === 'es';

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = mockTasks.filter(task => {
    const matchesCompletion = 
      filter === 'all' || 
      (filter === 'pending' && !task.isCompleted) ||
      (filter === 'completed' && task.isCompleted);
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCompletion && matchesPriority && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: mockTasks.filter(t => !t.isCompleted).length,
    today: mockTasks.filter(t => {
      const today = new Date().toDateString();
      const taskDate = new Date(t.dueDate).toDateString();
      return today === taskDate && !t.isCompleted;
    }).length,
    overdue: mockTasks.filter(t => {
      return new Date(t.dueDate) < new Date() && !t.isCompleted;
    }).length,
    thisWeek: mockTasks.filter(t => {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const taskDate = new Date(t.dueDate);
      return taskDate <= weekFromNow && taskDate >= new Date() && !t.isCompleted;
    }).length
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, class: 'text-red-400 font-semibold' };
    if (diffDays === 0) return { text: 'Today', class: 'text-orange-400 font-semibold' };
    if (diffDays === 1) return { text: 'Tomorrow', class: 'text-yellow-400 font-semibold' };
    if (diffDays < 7) return { text: `${diffDays} days`, class: 'text-blue-400' };
    return { text: date.toLocaleDateString(), class: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight text-[#DEDBC8]">{t('title')}</h1>
          <p className="text-gray-400 mt-2 text-sm">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newTask')}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('pendingTasks')}</CardDescription>
            <CardTitle className="text-3xl text-white">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('dueToday')}</CardDescription>
            <CardTitle className="text-3xl text-orange-400">{stats.today}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('overdue')}</CardDescription>
            <CardTitle className="text-3xl text-red-400">{stats.overdue}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-white/5 bg-[#101010] shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">{t('thisWeek')}</CardDescription>
            <CardTitle className="text-3xl text-blue-400">{stats.thisWeek}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-white/5 bg-[#101010] shadow-xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:w-96 border-white/10 bg-[#1A1A1A] text-white placeholder:text-gray-500"
            />
            
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'all', 'completed'] as const).map((f) => (
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

            <div className="flex gap-2 flex-wrap lg:ml-auto">
              {(['all', 'urgent', 'high'] as const).map((p) => (
                <Button
                  key={p}
                  variant={priorityFilter === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriorityFilter(p)}
                  className={priorityFilter !== p ? 'border-white/10 text-gray-300 hover:bg-white/5' : ''}
                >
                  {p === 'all' ? t('allPriority') : t(p)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const PriorityIcon = priorityIcons[task.priority as keyof typeof priorityIcons];
              const dueInfo = getDaysUntil(task.dueDate);

              return (
                <div
                  key={task.id}
                  className={`border border-white/5 rounded-xl p-4 transition-all ${
                    task.isCompleted 
                      ? 'bg-white/5 opacity-75' 
                      : 'bg-[#0B0F15] hover:bg-white/5 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <button
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {task.isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-white ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                        </div>
                        
                        <span className={`ml-4 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          <PriorityIcon className="h-3 w-3" />
                          {t(task.priority as 'urgent' | 'high' | 'medium' | 'low')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-400">{task.caseNumber}</span>
                          <span className="text-gray-600">·</span>
                          <span className="font-medium text-gray-300">{task.clientName}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className={dueInfo.class}>
                            {dueInfo.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-400">
                          <span className="text-xs">{t('assignedTo')}:</span>
                          <span className="text-xs font-medium text-gray-300">{task.assignedTo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        {t('edit')}
                      </Button>
                      {task.isCompleted ? (
                        <Button size="sm" variant="ghost">
                          {t('reopen')}
                        </Button>
                      ) : (
                        <Button size="sm">
                          {t('complete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedTasks.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">{t('noTasksFound')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
