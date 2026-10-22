'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

type Task = { id: number; title: string; description: string | null; dueDate: string | null; priority: string | null; isCompleted: boolean | null };

export default function TasksPage() {
  const es = useLocale().startsWith('es');
  const c = es ? { title: 'Tareas y plazos', subtitle: 'Organiza el trabajo pendiente de tu firma', add: 'Nueva tarea', load: 'Cargando tareas…', empty: 'Todavía no hay tareas. Crea la primera.', error: 'No pudimos cargar las tareas.', retry: 'Reintentar', name: 'Título', description: 'Descripción', due: 'Fecha límite', priority: 'Prioridad', save: 'Crear tarea', cancel: 'Cancelar', saving: 'Guardando…', required: 'Escribe un título.', noDue: 'Sin fecha límite' } : { title: 'Tasks & deadlines', subtitle: 'Organize your firm’s pending work', add: 'New task', load: 'Loading tasks…', empty: 'No tasks yet. Create the first one.', error: 'We could not load the tasks.', retry: 'Retry', name: 'Title', description: 'Description', due: 'Due date', priority: 'Priority', save: 'Create task', cancel: 'Cancel', saving: 'Saving…', required: 'Enter a title.', noDue: 'No due date' };
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await fetch('/api/tasks', { cache: 'no-store' }); if (!response.ok) throw new Error(); setItems((await response.json()).tasks ?? []); }
    catch { setError(c.error); } finally { setLoading(false); }
  }, [c.error]);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!form.title.trim()) { setError(c.required); return; }
    setSaving(true);
    try {
      const body = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined };
      const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error();
      const data = await response.json(); setItems(current => [data.task, ...current]);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium' }); setOpen(false);
    } catch { setError(es ? 'No pudimos crear la tarea.' : 'We could not create the task.'); } finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-serif italic text-[#DEDBC8]">{c.title}</h1><p className="mt-1 text-sm text-gray-400">{c.subtitle}</p></div><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />{c.add}</Button></header>
    {error && <div role="alert" className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"><span>{error}</span><Button variant="ghost" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />{c.retry}</Button></div>}
    {loading ? <p role="status" className="py-12 text-center text-gray-400">{c.load}</p> : items.length === 0 ? <Card className="border-white/5 bg-[#101010]"><CardContent className="p-12 text-center"><Calendar className="mx-auto mb-3 h-10 w-10 text-gray-600" /><p className="text-gray-400">{c.empty}</p></CardContent></Card> : <ul className="space-y-3">{items.map(task => <li key={task.id} className="rounded-xl border border-white/5 bg-[#101010] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h2><p className="mt-1 text-sm text-gray-400">{task.description || '—'}</p></div><span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">{task.priority}</span></div><p className="mt-3 flex items-center gap-2 text-xs text-gray-500"><Calendar className="h-3.5 w-3.5" />{task.dueDate ? new Intl.DateTimeFormat(es ? 'es' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(task.dueDate)) : c.noDue}</p></li>)}</ul>}
    <Modal isOpen={open} onClose={() => setOpen(false)} title={c.add}><form onSubmit={submit} className="space-y-4"><label className="block text-sm text-gray-300">{c.name}<input required maxLength={240} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><label className="block text-sm text-gray-300">{c.description}<textarea maxLength={4000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full resize-none rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><label className="block text-sm text-gray-300">{c.due}<input type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><label className="block text-sm text-gray-300">{c.priority}<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white">{['low', 'medium', 'high', 'urgent'].map(value => <option key={value}>{value}</option>)}</select></label><div className="flex gap-3"><Button type="submit" disabled={saving} className="flex-1">{saving ? c.saving : c.save}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">{c.cancel}</Button></div></form></Modal>
  </div>;
}
