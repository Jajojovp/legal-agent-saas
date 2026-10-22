'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, Star, Quote, MessageSquare, Target, ShieldCheck } from 'lucide-react';
import { WordsPullUp } from '@/components/ui/words-pull-up';
import { AnimatedLetter } from '@/components/ui/animated-letter';
import { ChatWidget } from '@/components/chatbot/chat-widget';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'es' : 'en';
  const otherLabel = locale === 'en' ? 'ES' : 'EN';


  // Feature cards animation hook
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-[#0B0F15] text-[#DEDBC8] font-sans overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      
      {/* =========================================
          SECTION 1: HERO
          ========================================= */}
      <section className="h-screen w-full p-4 md:p-6">
        <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-black">
          
          <img
            src="/hero-bg.png"
            alt="LegalAgent Dashboard"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          
          <div className="noise-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F15]/60 via-transparent to-[#0B0F15]/90 pointer-events-none" />

          <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 mt-6">
            <div className="bg-[#0B0F15]/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-14 border border-white/10 shadow-2xl">
              <Link href="#about" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
                {t('nav.features')}
              </Link>
              <Link href="/register" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
                {locale === 'es' ? 'Acceso gratuito' : 'Free access'}
              </Link>
              <Link href="/login" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
                {t('nav.signIn')}
              </Link>
              <Link href={otherLocale} locale={otherLocale} className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium border-l border-white/20 pl-4 sm:pl-6">
                {otherLabel}
              </Link>
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8">
                <WordsPullUp 
                  text="LegalAgent" 
                  showAsterisk={true}
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium leading-[0.9] tracking-tight text-primary"
                />
              </div>
              <div className="md:col-span-4 flex flex-col items-start md:items-end text-left md:text-right gap-6 md:pb-4">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-primary/80 text-sm sm:text-base leading-relaxed max-w-sm"
                >
                  {t('landing.hero.subtitle')}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href="/register" className="group inline-flex items-center gap-4 bg-primary hover:bg-primary/90 text-black rounded-full pl-6 pr-2 py-2 transition-all hover:gap-6">
                    <span className="font-semibold text-sm sm:text-base uppercase tracking-wider">{t('landing.hero.ctaPrimary')}</span>
                    <div className="bg-black rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2: ABOUT
          ========================================= */}
      <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#0B0F15]">
        <div className="max-w-5xl mx-auto bg-[#101010] rounded-[2rem] p-8 md:p-16 lg:p-24 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-primary tracking-widest uppercase text-[10px] sm:text-xs mb-8 font-bold">
              {t('landing.about.badge', { defaultValue: 'Legal Intelligence' })}
            </span>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-medium leading-[1.2] mb-6">
                {t('landing.about.title1', { defaultValue: 'We are LegalAgent,' })}{' '}
                <span className="font-serif italic text-primary">{t('landing.about.title2', { defaultValue: 'an AI-powered OS.' })}</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                {locale === 'es' ? 'Centralizamos asuntos, tareas y asistencia con IA para firmas modernas.' : 'We centralize matters, tasks, and AI assistance for modern law firms.'}
              </p>
            </motion.div>

            <div className="max-w-2xl text-left sm:text-center text-[#DEDBC8] text-sm sm:text-base md:text-lg leading-relaxed">
              <AnimatedLetter 
                text={locale === 'en' 
                  ? "Over the last years, we have worked to craft a system that understands the unique needs of legal professionals. Together, we have created an environment that saves hours of administrative work, allowing attorneys to focus on what truly matters: winning cases and helping clients."
                  : "Durante los últimos años, hemos trabajado para crear un sistema que entiende las necesidades únicas de los profesionales legales. Juntos, hemos creado un entorno que ahorra horas de trabajo administrativo, permitiendo a los abogados centrarse en lo que realmente importa: ganar casos y ayudar a sus clientes."
                } 
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: FEATURES
          ========================================= */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 min-h-screen relative">
        <div className="bg-noise opacity-[0.15]" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4"
            >
              {t('sales.howItWorks.title', { defaultValue: 'Cómo Capturamos Prospectos en Piloto Automático' })}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500"
            >
              {t('sales.howItWorks.subtitle', { defaultValue: 'Sistema simple que trabaja mientras duermes' })}
            </motion.p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              delay={0.15}
              isInView={isFeaturesInView}
              number="01"
              title={t('sales.howItWorks.steps.0.title', { defaultValue: 'IA Captura Prospectos 24/7' })}
              icon={MessageSquare}
              items={[
                t('sales.howItWorks.steps.0.bullet1', { defaultValue: "Califica visitantes web al instante" }),
                t('sales.howItWorks.steps.0.bullet2', { defaultValue: "Agenda consultas automáticamente" }),
                t('sales.howItWorks.steps.0.bullet3', { defaultValue: "Recopila información de contacto" })
              ]}
              t={t}
            />

            <FeatureCard 
              delay={0.3}
              isInView={isFeaturesInView}
              number="02"
              title={t('sales.howItWorks.steps.1.title', { defaultValue: 'Puntuación Inteligente' })}
              icon={Target}
              items={[
                t('sales.howItWorks.steps.1.bullet1', { defaultValue: "Analiza urgencia del caso" }),
                t('sales.howItWorks.steps.1.bullet2', { defaultValue: "Filtra prospectos de bajo valor" }),
                t('sales.howItWorks.steps.1.bullet3', { defaultValue: "Notifica a tu equipo al instante" })
              ]}
              t={t}
            />

            <FeatureCard 
              delay={0.45}
              isInView={isFeaturesInView}
              number="03"
              title={locale === 'es' ? 'Protege la información de tu firma' : 'Protect your firm data'}
              icon={ShieldCheck}
              items={[
                locale === 'es' ? 'Datos separados por firma' : 'Firm-isolated data',
                locale === 'es' ? 'Acceso autenticado y auditable' : 'Authenticated, auditable access',
                locale === 'es' ? 'Sin cobros ni límites por plan' : 'No charges or plan limits'
              ]}
              t={t}
            />
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4: TESTIMONIALS
          ========================================= */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#05070A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-primary tracking-widest uppercase text-xs font-bold mb-4 block">
              {t('landing.testimonials.badge', { defaultValue: 'Trust & Excellence' })}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] mb-6 italic">
              {t('landing.testimonials.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: t('landing.testimonials.quote1', { defaultValue: "LegalAgent completely transformed how we handle discovery and intake. The AI integration saves us around 15 hours a week." }),
                name: "Sarah Jenkins",
                role: t('landing.testimonials.role1', { defaultValue: "Managing Partner, Jenkins & Co" }),
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
              },
              {
                quote: locale === 'es' ? 'Centralizamos asuntos y plazos sin depender de hojas de cálculo.' : 'We centralized matters and deadlines without relying on spreadsheets.',
                name: "Carlos Mendoza",
                role: t('landing.testimonials.role2', { defaultValue: "Founder, Mendoza Legal" }),
                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80"
              },
              {
                quote: t('landing.testimonials.quote3', { defaultValue: "It's rare to find a platform that feels this premium while delivering actual enterprise-grade power. Exceptional." }),
                name: "Elena Rostova",
                role: t('landing.testimonials.role3', { defaultValue: "Senior Counsel" }),
                img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-[#101010] border border-white/5 p-8 rounded-2xl flex flex-col justify-between">
                <div>
                  <Quote className="text-primary/40 w-8 h-8 mb-6" />
                  <p className="text-gray-300 text-lg leading-relaxed mb-8">&ldquo;{testimonial.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={testimonial.img} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                  <div>
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-primary/70 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 5: BLOG / LEGAL RESOURCES
          ========================================= */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#0B0F15] relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] italic mb-6">
              {locale === 'es' ? 'Recursos Legales' : 'Legal Resources'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Artículos, guías y recursos para ayudar a tu firma a crecer con tecnología.'
                : 'Articles, guides and resources to help your firm grow with technology.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: locale === 'es' ? 'IA para Abogados: Guía Completa 2026' : 'AI for Lawyers: Complete Guide 2026',
                excerpt: locale === 'es'
                  ? 'Cómo la inteligencia artificial está transformando la práctica legal y cómo tu firma puede aprovecharla.'
                  : 'How artificial intelligence is transforming legal practice and how your firm can leverage it.',
                image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
                href: '/blog/ai-for-lawyers-guide',
              },
              {
                title: locale === 'es' ? 'Captación de Clientes en la Era Digital' : 'Client Acquisition in the Digital Age',
                excerpt: locale === 'es'
                  ? 'Estrategias probadas para captar más clientes legales usando marketing digital y automatización.'
                  : 'Proven strategies to capture more legal clients using digital marketing and automation.',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                href: '/blog/client-acquisition-digital',
              },
              {
                title: locale === 'es' ? 'Automatización de Firmas Legales' : 'Law Firm Automation',
                excerpt: locale === 'es'
                  ? 'Guía paso a paso para organizar asuntos, plazos y comunicación con clientes.'
                  : 'Step-by-step guide to organize matters, deadlines, and client communication.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
                href: '/blog/law-firm-automation',
              },
            ].map((post, i) => (
              <Link key={i} href={post.href} className="group">
                <div className="bg-[#101010] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-white mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-4 text-primary text-sm font-medium">
                      {locale === 'es' ? 'Leer más' : 'Read more'} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
              {locale === 'es' ? 'Ver todos los artículos' : 'View all articles'} →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 7: CTA & FOOTER
          ========================================= */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80" alt="Office Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F15] via-[#0B0F15]/80 to-[#0B0F15]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-serif italic text-[#DEDBC8] mb-8">
            {t('landing.cta.title')}
          </h2>
          <Link href="/register" className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-black rounded-full px-8 py-4 font-semibold text-lg transition-transform hover:scale-105">
            {t('landing.cta.ctaPrimary')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <footer className="relative z-10 max-w-7xl mx-auto border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded overflow-hidden bg-white/10 flex items-center justify-center border border-white/5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-white tracking-tight">LegalAgent</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-primary transition-colors">{t('landing.footer.privacy')}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{t('landing.footer.terms')}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{t('landing.footer.contact')}</Link>
          </div>
          
          <div className="text-gray-600 text-sm">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </footer>
      </section>

      <ChatWidget 
        firmName="LegalAgent"
        practiceAreas={['Personal Injury', 'Family Law', 'Criminal Defense']}
        mode="public"
      />
    </div>
  );
}

function FeatureCard({ delay, isInView, number, title, icon: Icon, items, t }: { delay: number, isInView: boolean, number: string, title: string, icon: any, items: string[], t: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#212121] rounded-[2rem] p-8 flex flex-col h-[400px] lg:h-auto border border-white/5 hover:bg-[#252525] transition-colors relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-gray-600 text-sm font-medium">{number}</span>
      </div>
      
      <h3 className="text-xl font-medium text-white mb-6 relative z-10">{title}</h3>
      
      <ul className="space-y-4 flex-1 relative z-10">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
            <span className="text-gray-400 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <Link href="/login" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:text-primary/80 transition-colors mt-8 group-hover:gap-3 relative z-10">
        {t('common.learnMore', { defaultValue: 'Learn more' })}
        <ArrowRight className="w-4 h-4 -rotate-45" />
      </Link>
    </motion.div>
  );
}
