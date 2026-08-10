'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Scale, TrendingUp, Zap, Globe, Users, BarChart3 } from 'lucide-react';
import { ChatWidget } from '@/components/chatbot/chat-widget';

const features = [
  { icon: Zap, titleKey: 'landing.features.chatbot.title', descKey: 'landing.features.chatbot.description' },
  { icon: BarChart3, titleKey: 'landing.features.analytics.title', descKey: 'landing.features.analytics.description' },
  { icon: Scale, titleKey: 'landing.features.security.title', descKey: 'landing.features.security.description' },
  { icon: TrendingUp, titleKey: 'landing.features.growth.title', descKey: 'landing.features.growth.description' },
  { icon: Users, titleKey: 'landing.features.crm.title', descKey: 'landing.features.crm.description' },
];

const stats = [
  { value: '500+', labelKey: 'sales.socialProof.firmsLabel' },
  { value: '127%', labelKey: 'sales.socialProof.leadsLabel' },
  { value: '18hrs', labelKey: 'sales.socialProof.timeLabel' },
];

export default function FeaturesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => { setIsVisible(true); }, []);

  return (
    <div className="min-h-screen bg-[#05070A] font-sans">
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-7xl font-serif text-[#DEDBC8] italic mb-6">
              {locale === 'es' ? 'Todo lo que tu Firma Necesita' : 'Everything Your Firm Needs'}
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Una plataforma completa de gestión legal potenciada por inteligencia artificial.'
                : 'A complete legal practice management platform powered by artificial intelligence.'}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-6 rounded-xl text-lg">
                {locale === 'es' ? 'Comenzar Gratis' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-gray-600 text-sm mt-4">
              {locale === 'es' ? 'Sin tarjeta de crédito • Configuración en 5 minutos' : 'No credit card required • Setup in 5 minutes'}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-serif italic text-primary mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0F15]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] italic text-center mb-16">
              {locale === 'es' ? 'Características Principales' : 'Core Features'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-[#101010] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-3">{t(feature.titleKey)}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{t(feature.descKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] italic text-center mb-16">
              {locale === 'es' ? '¿Por qué elegir LegalAgent?' : 'Why Choose LegalAgent?'}
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: locale === 'es' ? 'IA que trabaja para ti 24/7' : 'AI that works for you 24/7',
                  desc: locale === 'es'
                    ? 'Nuestro chatbot con IA captura y califica prospectos mientras tú duermes. Nunca pierdas un cliente potencial.'
                    : 'Our AI chatbot captures and qualifies leads while you sleep. Never miss a potential client again.',
                },
                {
                  title: locale === 'es' ? 'Todo en un solo lugar' : 'All in one place',
                  desc: locale === 'es'
                    ? 'CRM, gestión de casos, facturación y analíticas en una plataforma integrada y fácil de usar.'
                    : 'CRM, case management, billing and analytics in one integrated, easy-to-use platform.',
                },
                {
                  title: locale === 'es' ? 'Diseñado para firmas modernas' : 'Designed for modern firms',
                  desc: locale === 'es'
                    ? 'Interfaz intuitiva, soporte multi-idioma y herramientas que se adaptan a la forma en que trabajas.'
                    : 'Intuitive interface, multi-language support and tools that adapt to how you work.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#101010] border border-white/5 rounded-xl p-6">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-[#0B0F15]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-[#DEDBC8] italic mb-6">
              {locale === 'es' ? '¿Listo para Transformar tu Práctica?' : 'Ready to Transform Your Practice?'}
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {locale === 'es'
                ? 'Únete a las firmas que ya están usando IA para crecer más rápido.'
                : 'Join the firms already using AI to grow faster.'}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-6 rounded-xl text-lg">
                {locale === 'es' ? 'Comenzar Gratis' : 'Start Free Trial'}
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <ChatWidget firmName="LegalAgent" mode="public" />
    </div>
  );
}
