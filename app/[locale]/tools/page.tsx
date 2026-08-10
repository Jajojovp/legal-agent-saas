'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Calculator, Calendar, FileText, Scale, Shield, Gavel, AlertTriangle, BookOpen } from 'lucide-react';

const tools = [
  { title: 'Calculadora de Honorarios', desc: 'Calcula honorarios legales: fijo, por hora o contingencia.', icon: Calculator, slug: 'honorarios', color: 'from-blue-500/20 to-blue-500/5' },
  { title: 'Plazos Procesales', desc: 'Calcula días hábiles y vencimientos judiciales.', icon: Calendar, slug: 'plazos', color: 'from-green-500/20 to-green-500/5' },
  { title: 'Generador de Contratos', desc: 'Crea contratos simples al instante.', icon: FileText, slug: 'contratos', color: 'from-orange-500/20 to-orange-500/5' },
  { title: 'Analizador de Riesgos', desc: 'Evalúa riesgos contractuales automáticamente.', icon: AlertTriangle, slug: 'riesgos', color: 'from-red-500/20 to-red-500/5' },
  { title: 'Checklist Compliance', desc: 'Listas de cumplimiento normativo.', icon: Shield, slug: 'compliance', color: 'from-purple-500/20 to-purple-500/5' },
  { title: 'Calculadora de Intereses', desc: 'Calcula intereses moratorios y legales.', icon: Calculator, slug: 'intereses', color: 'from-yellow-500/20 to-yellow-500/5' },
  { title: 'Buscador de Jurisprudencia', desc: 'Encuentra precedentes y sentencias.', icon: Gavel, slug: 'jurisprudencia', color: 'from-indigo-500/20 to-indigo-500/5' },
  { title: 'Guía de Legislación', desc: 'Resúmenes de leyes y normativas.', icon: BookOpen, slug: 'legislacion', color: 'from-teal-500/20 to-teal-500/5' },
  { title: 'Calculadora de Indemnizaciones', desc: 'Calcula indemnizaciones laborales por despido.', icon: Calculator, slug: 'indemnizaciones', color: 'from-pink-500/20 to-pink-500/5' },
];

export default function ToolsPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#05070A] font-sans">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif text-[#DEDBC8] italic mb-4">
            {locale === 'es' ? 'Herramientas Legales' : 'Legal Tools'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Recursos gratuitos para optimizar tu práctica legal diaria.'
              : 'Free resources to optimize your daily legal practice.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <Link key={i} href={`/tools/${tool.slug}`} className="group">
                <div className="bg-[#101010] border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} border border-white/5 flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-medium mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
