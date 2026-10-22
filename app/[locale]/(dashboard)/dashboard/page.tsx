'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertTriangle, ArrowRight, BriefcaseBusiness, CalendarClock, FileSearch, FileText, Loader2, RefreshCw, Sparkles, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Workspace = {
  kpi: { newLeads: number; activeCases: number; pendingTasks: number };
  recentLeads: Array<{ id: number; name: string; practiceArea: string | null; status: string | null; score: number | null; createdAt: string | null }>;
  recentCases: Array<{ id: number; caseNumber: string; clientName: string; practiceArea: string | null; status: string | null; updatedAt: string | null }>;
  upcomingTasks: Array<{ id: number; caseId: number | null; title: string; dueDate: string | null; priority: string | null }>;
};

const EMPTY: Workspace = { kpi: { newLeads: 0, activeCases: 0, pendingTasks: 0 }, recentLeads: [], recentCases: [], upcomingTasks: [] };

export default function DashboardPage() {
  const locale = useLocale();
  const es = locale === 'es';
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWorkspace = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/dashboard/kpi', { cache: 'no-store' });
      if (!response.ok) throw new Error('workspace');
      setWorkspace(await response.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadWorkspace(); }, []);

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center" aria-busy="true"><Loader2 className="h-7 w-7 animate-spin text-primary" /><span className="sr-only">Loading workspace</span></div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center" role="alert">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold text-white">{es ? 'No pudimos cargar tu espacio de trabajo' : 'We could not load your workspace'}</h1>
        <p className="mt-2 text-sm text-gray-400">{es ? 'Tus datos no se modificaron. Revisa la conexión e inténtalo de nuevo.' : 'Your data was not changed. Check the connection and try again.'}</p>
        <Button onClick={loadWorkspace} className="mt-6"><RefreshCw className="mr-2 h-4 w-4" />{es ? 'Reintentar' : 'Try again'}</Button>
      </div>
    );
  }

  const isNewFirm = workspace.kpi.newLeads + workspace.kpi.activeCases + workspace.kpi.pendingTasks === 0;
  const date = (value: string | null) => value
    ? new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(value))
    : (es ? 'Sin fecha' : 'No date');

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{es ? 'Centro de trabajo' : 'Work center'}</p>
          <h1 className="mt-2 text-3xl font-serif italic text-[#DEDBC8]">{es ? 'Tu práctica, en contexto' : 'Your practice, in context'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">{es ? 'Prioriza vencimientos, retoma asuntos y usa la IA con información del trabajo que ya estás realizando.' : 'Prioritize deadlines, resume matters, and use AI with the context of the work already underway.'}</p>
        </div>
        <Button asChild className="bg-primary text-black hover:bg-primary/90"><Link href="/dashboard/leads/new"><Users className="mr-2 h-4 w-4" />{es ? 'Registrar prospecto' : 'Add lead'}</Link></Button>
      </header>

      {isNewFirm && <GettingStarted es={es} />}

      <section aria-label={es ? 'Resumen de la firma' : 'Firm summary'} className="grid gap-3 sm:grid-cols-3">
        <Metric label={es ? 'Prospectos a gestionar' : 'Leads to manage'} action={es ? 'Abrir' : 'Open'} value={workspace.kpi.newLeads} icon={Users} href="/dashboard/leads" />
        <Metric label={es ? 'Asuntos activos' : 'Active matters'} action={es ? 'Abrir' : 'Open'} value={workspace.kpi.activeCases} icon={BriefcaseBusiness} href="/dashboard/cases" />
        <Metric label={es ? 'Tareas pendientes' : 'Pending tasks'} action={es ? 'Abrir' : 'Open'} value={workspace.kpi.pendingTasks} icon={CalendarClock} href="/dashboard/tasks" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">{es ? 'Comenzar trabajo legal' : 'Start legal work'}</h2><p className="text-sm text-gray-500">{es ? 'Flujos guiados; no necesitas aprender comandos.' : 'Guided workflows; no prompt expertise required.'}</p></div></div>
        <div className="grid gap-3 md:grid-cols-3">
          <Workflow icon={FileSearch} title={es ? 'Analizar un documento' : 'Analyze a document'} description={es ? 'Identifica cláusulas, obligaciones y riesgos con revisión humana.' : 'Identify clauses, obligations, and risks with human review.'} action={es ? 'Comenzar' : 'Start'} href="/tools/riesgos" />
          <Workflow icon={FileText} title={es ? 'Preparar un contrato' : 'Prepare a contract'} description={es ? 'Parte de una estructura guiada y revisa antes de exportar.' : 'Start from a guided structure and review before export.'} action={es ? 'Comenzar' : 'Start'} href="/tools/contratos" />
          <Workflow icon={Sparkles} title={es ? 'Consultar al copiloto' : 'Ask the copilot'} description={es ? 'Abre el asistente en la esquina inferior para trabajar en lenguaje natural.' : 'Open the assistant in the lower corner and work in plain language.'} action={es ? 'Comenzar' : 'Start'} href="/dashboard" />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="border-white/10 bg-[#101010]">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base text-white">{es ? 'Próximos vencimientos' : 'Upcoming deadlines'}</CardTitle><Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">{es ? 'Ver tareas' : 'View tasks'}</Link></CardHeader>
          <CardContent className="space-y-2">
            {workspace.upcomingTasks.length ? workspace.upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
                <span className={`h-2 w-2 rounded-full ${task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-400' : 'bg-primary'}`} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-100">{task.title}</p><p className="text-xs text-gray-500">{task.caseId ? `${es ? 'Asunto' : 'Matter'} #${task.caseId}` : (es ? 'Tarea general' : 'General task')}</p></div>
                <time className="text-xs text-gray-400">{date(task.dueDate)}</time>
              </div>
            )) : <Empty text={es ? 'No tienes vencimientos pendientes.' : 'You have no pending deadlines.'} />}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#101010]">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base text-white">{es ? 'Asuntos recientes' : 'Recent matters'}</CardTitle><Link href="/dashboard/cases" className="text-xs text-primary hover:underline">{es ? 'Ver asuntos' : 'View matters'}</Link></CardHeader>
          <CardContent className="space-y-2">
            {workspace.recentCases.length ? workspace.recentCases.map((matter) => (
              <div key={matter.id} className="rounded-lg border border-white/5 p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-gray-100">{matter.clientName}</p><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase text-gray-400">{matter.status}</span></div><p className="mt-1 text-xs text-gray-500">{matter.caseNumber} · {matter.practiceArea?.replaceAll('-', ' ') ?? (es ? 'Sin área' : 'No practice area')}</p></div>
            )) : <Empty text={es ? 'Aún no hay asuntos. Convierte un prospecto o crea el primero.' : 'No matters yet. Convert a lead or create the first one.'} />}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#101010]">
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base text-white">{es ? 'Prospectos recientes' : 'Recent leads'}</CardTitle><Link href="/dashboard/leads" className="text-xs text-primary hover:underline">{es ? 'Abrir CRM' : 'Open CRM'}</Link></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {workspace.recentLeads.length ? workspace.recentLeads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between rounded-lg border border-white/5 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-100">{lead.name}</p><p className="text-xs text-gray-500">{lead.practiceArea?.replaceAll('-', ' ') ?? (es ? 'Área por definir' : 'Practice area pending')}</p></div><div className="text-right"><p className="text-xs text-primary">{lead.score ?? 0}/100</p><p className="text-[10px] uppercase text-gray-500">{lead.status}</p></div></div>
          )) : <Empty text={es ? 'No hay prospectos todavía.' : 'No leads yet.'} />}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, action, value, icon: Icon, href }: { label: string; action: string; value: number; icon: typeof Users; href: string }) {
  return <Link href={href} className="group rounded-xl border border-white/10 bg-[#101010] p-5 hover:border-primary/40"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-400">{label}</p><p className="mt-2 text-3xl font-semibold text-white">{value}</p></div><Icon className="h-5 w-5 text-primary" /></div><span className="mt-4 inline-flex items-center text-xs text-gray-500 group-hover:text-primary">{action} <ArrowRight className="ml-1 h-3 w-3" /></span></Link>;
}

function Workflow({ icon: Icon, title, description, action, href }: { icon: typeof FileText; title: string; description: string; action: string; href: string }) {
  return <Link href={href} className="group rounded-xl border border-white/10 bg-[#101010] p-5 hover:border-primary/40"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-5 font-medium text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-400">{description}</p><span className="mt-4 inline-flex items-center text-xs text-primary">{action} <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" /></span></Link>;
}

function GettingStarted({ es }: { es: boolean }) {
  return <aside className="rounded-xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-primary">{es ? 'Primeros pasos' : 'Getting started'}</p><h2 className="mt-2 text-lg font-semibold text-white">{es ? 'Configura tu firma en tres pasos' : 'Set up your firm in three steps'}</h2><ol className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-3"><li>1. {es ? 'Registra tu primer prospecto' : 'Add your first lead'}</li><li>2. {es ? 'Crea un asunto y sus fechas' : 'Create a matter and deadlines'}</li><li>3. {es ? 'Prueba un flujo de IA guiado' : 'Try a guided AI workflow'}</li></ol></aside>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">{text}</div>; }
