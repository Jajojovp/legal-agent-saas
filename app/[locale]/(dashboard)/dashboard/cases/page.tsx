'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Briefcase, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

type CaseRecord = { id: number; caseNumber: string; clientName: string; practiceArea: string | null; status: string | null; description: string | null; estimatedValue: string | null };
const areas = ['personal-injury', 'family-law', 'criminal-defense', 'estate-planning', 'business-law', 'real-estate', 'immigration', 'employment-law', 'bankruptcy', 'intellectual-property'];

export default function CasesPage() {
  const es = useLocale().startsWith('es');
  const copy = es ? { title: 'Casos', subtitle: 'Gestiona los asuntos reales de tu firma', create: 'Nuevo caso', loading: 'Cargando casos…', empty: 'Todavía no hay casos. Crea el primero.', error: 'No pudimos cargar los casos.', retry: 'Reintentar', client: 'Cliente', area: 'Área jurídica', description: 'Descripción', value: 'Valor estimado', save: 'Crear caso', cancel: 'Cancelar', saving: 'Guardando…', required: 'Completa los campos obligatorios.' } : { title: 'Cases', subtitle: 'Manage your firm’s real matters', create: 'New case', loading: 'Loading cases…', empty: 'No cases yet. Create the first one.', error: 'We could not load the cases.', retry: 'Retry', client: 'Client', area: 'Practice area', description: 'Description', value: 'Estimated value', save: 'Create case', cancel: 'Cancel', saving: 'Saving…', required: 'Complete the required fields.' };
  const [items, setItems] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientName: '', practiceArea: '', description: '', estimatedValue: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/cases', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setItems((await response.json()).cases ?? []);
    } catch { setError(copy.error); } finally { setLoading(false); }
  }, [copy.error]);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!form.clientName.trim() || !form.practiceArea) { setError(copy.required); return; }
    setSaving(true);
    try {
      const response = await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setItems(current => [data.case, ...current]); setOpen(false);
      setForm({ clientName: '', practiceArea: '', description: '', estimatedValue: '' });
    } catch { setError(es ? 'No pudimos crear el caso.' : 'We could not create the case.'); } finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-serif italic text-[#DEDBC8]">{copy.title}</h1><p className="mt-1 text-sm text-gray-400">{copy.subtitle}</p></div><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />{copy.create}</Button></header>
    {error && <div role="alert" className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"><span>{error}</span><Button variant="ghost" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />{copy.retry}</Button></div>}
    {loading ? <p role="status" className="py-12 text-center text-gray-400">{copy.loading}</p> : items.length === 0 ? <Card className="border-white/5 bg-[#101010]"><CardContent className="p-12 text-center"><Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-600" /><p className="text-gray-400">{copy.empty}</p></CardContent></Card> : <ul className="space-y-3">{items.map(item => <li key={item.id} className="rounded-xl border border-white/5 bg-[#101010] p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-medium text-white">{item.clientName}</h2><p className="mt-1 text-sm text-gray-400">{item.description || '—'}</p></div><span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">{item.status}</span></div><div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500"><span>{item.caseNumber}</span><span>{item.practiceArea?.replaceAll('-', ' ')}</span>{item.estimatedValue && <span>${Number(item.estimatedValue).toLocaleString()}</span>}</div></li>)}</ul>}
    <Modal isOpen={open} onClose={() => setOpen(false)} title={copy.create}><form onSubmit={submit} className="space-y-4"><label className="block text-sm text-gray-300">{copy.client}<input required maxLength={160} value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><label className="block text-sm text-gray-300">{copy.area}<select required value={form.practiceArea} onChange={e => setForm({ ...form, practiceArea: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white"><option value="">—</option>{areas.map(area => <option key={area} value={area}>{area.replaceAll('-', ' ')}</option>)}</select></label><label className="block text-sm text-gray-300">{copy.description}<textarea maxLength={4000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full resize-none rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><label className="block text-sm text-gray-300">{copy.value}<input type="number" min="0" step="0.01" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: e.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-2 text-white" /></label><div className="flex gap-3"><Button type="submit" disabled={saving} className="flex-1">{saving ? copy.saving : copy.save}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">{copy.cancel}</Button></div></form></Modal>
  </div>;
}
