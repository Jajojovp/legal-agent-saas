'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { AdBanner } from '@/components/ads/ad-banner';
import { AdSidebar } from '@/components/ads/ad-sidebar';
import { getAllArticles, pillars } from '@/lib/content/pillars';

const pillarNames: Record<string, { en: string; es: string; icon: string }> = {
  'software-para-abogados': { en: 'Software', es: 'Software', icon: '💻' },
  'ia-legal': { en: 'AI & Legal', es: 'IA Legal', icon: '🤖' },
  'automatizacion-legal': { en: 'Automation', es: 'Automatización', icon: '⚡' },
  'gestion-documental': { en: 'Document Management', es: 'Gestión Documental', icon: '📁' },
  'contratos': { en: 'Contracts', es: 'Contratos', icon: '📝' },
  'jurisprudencia': { en: 'Jurisprudence', es: 'Jurisprudencia', icon: '⚖️' },
  'demandas': { en: 'Lawsuits', es: 'Demandas', icon: '📋' },
  'compliance': { en: 'Compliance', es: 'Compliance', icon: '🛡️' },
  'proteccion-datos': { en: 'Data Protection', es: 'Protección de Datos', icon: '🔒' },
  'gestion-despacho': { en: 'Firm Management', es: 'Gestión del Despacho', icon: '🏢' },
  'crm-juridico': { en: 'Legal CRM', es: 'CRM Jurídico', icon: '👥' },
  'facturacion-legal': { en: 'Legal Billing', es: 'Facturación Legal', icon: '💰' },
  'agenda-judicial': { en: 'Court Calendar', es: 'Agenda Judicial', icon: '📅' },
  'investigacion-juridica': { en: 'Legal Research', es: 'Investigación Jurídica', icon: '🔍' },
  'firma-electronica': { en: 'E-Signature', es: 'Firma Electrónica', icon: '✍️' },
  'derecho-especialidad': { en: 'Practice Areas', es: 'Especialidades', icon: '📚' },
  'ia-para-clientes': { en: 'AI for Clients', es: 'IA para Clientes', icon: '💬' },
  'legaltech': { en: 'LegalTech', es: 'LegalTech', icon: '🚀' },
  'comparativas': { en: 'Comparisons', es: 'Comparativas', icon: '📊' },
  'recursos-gratuitos': { en: 'Free Resources', es: 'Recursos Gratuitos', icon: '🎁' },
};

export default function BlogPage() {
  const locale = useLocale() as 'en' | 'es';
  const isEs = locale === 'es';
  const articles = getAllArticles();

  const pillarArticles = pillars.map(pillar => ({
    ...pillar,
    pillarName: pillarNames[pillar.id] || { en: pillar.title, es: pillar.title, icon: '📄' },
    articles: articles.filter(a => a.pillar === pillar.id),
  })).filter(p => p.articles.length > 0);

  return (
    <div className="min-h-screen bg-[#05070A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif text-[#DEDBC8] italic mb-4">
            {isEs ? 'Blog & Recursos Legales' : 'Blog & Legal Resources'}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            {isEs
              ? 'Más de 30 artículos organizados en 20 áreas del derecho. Guías, tutoriales y análisis para modernizar tu práctica legal.'
              : 'Over 30 articles organized across 20 legal practice areas. Guides, tutorials and analysis to modernize your legal practice.'}
          </p>
        </div>

        <AdBanner format="leaderboard" className="mb-16" />

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-12">
            {pillarArticles.map((pillar) => (
              <section key={pillar.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{pillar.pillarName.icon}</span>
                  <h2 className="text-xl font-serif text-[#DEDBC8] italic">
                    {pillar.pillarName[locale] || pillar.title}
                  </h2>
                  <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                    {pillar.articles.length} {isEs ? 'artículos' : 'articles'}
                  </span>
                </div>
                <div className="space-y-4">
                  {pillar.articles.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <article className="bg-[#101010] border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
                        <div className="md:flex">
                          <div className="md:w-56 h-36 md:h-auto overflow-hidden shrink-0">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{pillar.pillarName[locale] || pillar.title}</span>
                              <span>{post.date}</span>
                            </div>
                            <h3 className="text-base font-medium text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                              {post.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-[#101010] border border-white/5 rounded-xl p-5 mb-6">
              <h3 className="text-white font-medium text-sm mb-4">{isEs ? 'Áreas' : 'Topics'}</h3>
              <div className="space-y-1">
                {pillarArticles.map((pillar) => (
                  <a key={pillar.id} href={`#${pillar.id}`} className="block text-sm text-gray-400 hover:text-primary transition-colors py-1">
                    {pillar.pillarName.icon} {pillar.pillarName[locale] || pillar.title}
                    <span className="text-xs text-gray-600 ml-1">({pillar.articles.length})</span>
                  </a>
                ))}
              </div>
            </div>
            <AdSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
