'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useRouter } from '@/i18n/navigation';

const practiceAreas = [
  'personal-injury', 'family-law', 'criminal-defense', 'estate-planning',
  'business-law', 'real-estate', 'immigration', 'employment-law',
  'bankruptcy', 'intellectual-property',
] as const;

export default function NewLeadPage() {
  const locale = useLocale();
  const isEs = locale === 'es';
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone') || undefined,
          practiceArea: form.get('practiceArea') || undefined,
          caseDescription: form.get('caseDescription') || undefined,
          source: 'dashboard',
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Create failed');
      router.push('/dashboard/leads');
      router.refresh();
    } catch {
      setError(isEs ? 'No se pudo crear el lead.' : 'Could not create the lead.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" className="text-gray-300">
        <Link href="/dashboard/leads"><ArrowLeft className="mr-2 h-4 w-4" />{isEs ? 'Volver a leads' : 'Back to leads'}</Link>
      </Button>
      <Card className="border border-white/5 bg-[#101010]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">{isEs ? 'Nuevo lead' : 'New lead'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <Field label={isEs ? 'Nombre completo' : 'Full name'} name="name" type="text" required />
            <Field label={isEs ? 'Correo electrónico' : 'Email'} name="email" type="email" required />
            <Field label={isEs ? 'Teléfono' : 'Phone'} name="phone" type="tel" />
            <label className="block text-sm font-medium text-gray-300">
              {isEs ? 'Área de práctica' : 'Practice area'}
              <select name="practiceArea" className="mt-2 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white">
                <option value="">{isEs ? 'Seleccionar' : 'Select'}</option>
                {practiceAreas.map((area) => <option key={area} value={area}>{area.replaceAll('-', ' ')}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-300">
              {isEs ? 'Descripción del asunto' : 'Case description'}
              <textarea name="caseDescription" maxLength={5000} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white" />
            </label>
            <div className="flex justify-end gap-3">
              <Button asChild variant="outline"><Link href="/dashboard/leads">{isEs ? 'Cancelar' : 'Cancel'}</Link></Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (isEs ? 'Creando…' : 'Creating…') : (isEs ? 'Crear lead' : 'Create lead')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, name, type, required = false }: { label: string; name: string; type: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-300">
      {label}
      <input name={name} type={type} required={required} maxLength={200} className="mt-2 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white" />
    </label>
  );
}
