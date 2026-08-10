'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdBanner } from '@/components/ads/ad-banner';
import { AdSidebar } from '@/components/ads/ad-sidebar';
import { getArticleBySlug, getAllArticles } from '@/lib/content/pillars';

export default function ArticlePage() {
  const locale = useLocale() as 'en' | 'es';
  const params = useParams();
  const slug = params.slug as string;
  const isEs = locale === 'es';
  const article = getArticleBySlug(slug);
  const allArticles = getAllArticles();

  if (!article) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">{isEs ? 'Artículo no encontrado' : 'Article not found'}</h1>
          <Link href="/blog" className="text-primary hover:text-primary/80">&larr; {isEs ? 'Volver al blog' : 'Back to blog'}</Link>
        </div>
      </div>
    );
  }

  const related = (article.relatedSlugs || [])
    .map(rs => getArticleBySlug(rs))
    .filter((a): a is NonNullable<typeof a> => a != null)
    .slice(0, 3);

  if (related.length === 0) {
    related.push(...allArticles.filter(a => a.slug !== slug).slice(0, 3));
  }

  return (
    <div className="min-h-screen bg-[#05070A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {isEs ? 'Volver al blog' : 'Back to blog'}
        </Link>

        <div className="grid lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{article.pillar}</span>
              <span>&bull;</span>
              <span>{article.date}</span>
              <span>&bull;</span>
              <span>{article.author}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] italic mb-8 leading-tight">
              {article.title}
            </h1>

            <div
              className="text-gray-200 leading-relaxed max-w-none space-y-6 [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:italic [&_h2]:text-[#DEDBC8] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-serif [&_h3]:italic [&_h3]:text-[#DEDBC8] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-gray-300 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-gray-300 [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <AdBanner format="banner" className="mt-12" />

            {related.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/5">
                <h2 className="text-xl font-serif text-[#DEDBC8] italic mb-6">
                  {isEs ? 'Artículos relacionados' : 'Related articles'}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`} className="bg-[#101010] border border-white/5 rounded-xl p-4 hover:border-primary/30 transition-all group">
                      <p className="text-sm text-white font-medium group-hover:text-primary transition-colors line-clamp-2">{r.title}</p>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="lg:col-span-1">
            <AdSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
