'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { Check, ChevronDown, ArrowRight, CreditCard, Shield } from 'lucide-react';

const plans = [
  {
    key: 'starter',
    monthlyPrice: 49,
    yearlyPrice: 468,
    monthlyPricePerYear: 588,
    features: ['features.attorney1', 'features.ai200', 'features.crmBasic', 'features.billing', 'features.support'],
    highlighted: false,
    badge: null,
  },
  {
    key: 'professional',
    monthlyPrice: 99,
    yearlyPrice: 948,
    monthlyPricePerYear: 1188,
    features: ['features.attorney3', 'features.ai500', 'features.crmFull', 'features.analyticsAdvanced', 'features.aiScoring', 'features.billing', 'features.supportPriority'],
    highlighted: true,
    badge: 'popular',
  },
  {
    key: 'firm',
    monthlyPrice: 199,
    yearlyPrice: 1908,
    monthlyPricePerYear: 2388,
    features: ['features.attorney10', 'features.ai2000', 'features.whiteLabel', 'features.api', 'features.crmFull', 'features.analyticsAdvanced', 'features.aiScoring', 'features.manager', 'features.support247'],
    highlighted: false,
    badge: null,
  },
];

const faqItems = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
];

export default function PricingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'es' : 'en';
  const otherLabel = locale === 'en' ? 'ES' : 'EN';
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0B0F15] text-[#DEDBC8] font-sans overflow-x-hidden selection:bg-primary/30 selection:text-primary">

      {/* NAV */}
      <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 mt-6">
        <div className="bg-[#0B0F15]/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-14 border border-white/10 shadow-2xl">
          <Link href="/" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
            {locale === 'en' ? 'Home' : 'Inicio'}
          </Link>
          <Link href="/#features" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
            {t('nav.features')}
          </Link>
          <Link href="/pricing" className="text-[10px] sm:text-xs text-primary transition-colors uppercase tracking-widest font-medium">
            {t('nav.pricing')}
          </Link>
          <Link href="/login" className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium">
            {t('nav.signIn')}
          </Link>
          <Link href={otherLocale} locale={otherLocale} className="text-[10px] sm:text-xs text-primary/80 hover:text-primary transition-colors uppercase tracking-widest font-medium border-l border-white/20 pl-4 sm:pl-6">
            {otherLabel}
          </Link>
        </div>
      </nav>

      {/* TAKENOS BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-24 left-0 right-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-primary/5 border border-primary/10 rounded-full px-5 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm text-primary/80">
            <Shield className="w-3.5 h-3.5" />
            <span>{locale === 'en' ? 'Secure payments with Takenos — Receive in USD, spend in your local currency' : 'Pagos seguros con Takenos — Recibe en USD, gasta en tu moneda local'}</span>
          </div>
        </div>
      </motion.div>

      {/* HERO */}
      <section className="pt-40 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-primary tracking-widest uppercase text-[10px] sm:text-xs font-bold mb-6 block"
          >
            {t('nav.pricing')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-medium text-white mb-6"
          >
            {t('pricing.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-4"
          >
            {t('pricing.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-primary text-sm font-medium bg-primary/10 rounded-full px-4 py-2 border border-primary/20"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('pricing.freeTrial')}
          </motion.div>
        </div>
      </section>

      {/* TOGGLE */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-gray-500'}`}>
            {t('pricing.monthly')}
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? 'bg-primary' : 'bg-gray-700'}`}
          >
            <motion.div
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ left: yearly ? 'calc(100% - 1.625rem)' : '0.125rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${yearly ? 'text-white' : 'text-gray-500'}`}>
            {t('pricing.yearly')}
          </span>
          {yearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full"
            >
              {t('pricing.savePercent', { percent: 20 })}
            </motion.span>
          )}
        </div>
      </section>

      {/* PLAN CARDS */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-[#101010] border rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-primary/50 ring-1 ring-primary/20 scale-[1.02] md:scale-105'
                  : 'border-white/5 hover:border-white/10'
              } transition-all duration-300`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  {t('pricing.popular')}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {t(`pricing.${plan.key}.name`)}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(`pricing.${plan.key}.subtitle`)}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500 text-sm">{t('pricing.perMonth')}</span>
                </div>
                {yearly && (
                  <p className="text-xs text-gray-600 mt-1">
                    ${plan.monthlyPricePerYear}{locale === 'en' ? '/year billed annually' : '/año facturado anualmente'}
                  </p>
                )}
              </div>

              <Link
                href="/register"
                className={`w-full text-center py-3 rounded-full font-semibold text-sm transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-primary text-black hover:bg-primary/90'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {t('pricing.cta')}
              </Link>

              <div className="space-y-3.5">
                {plan.features.map((featureKey) => (
                  <div key={featureKey} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-400">{t(`pricing.${featureKey}`)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 text-primary/50" />
                <span className="text-[10px] text-gray-600">{t('payment.secure')}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-sm text-gray-600 mt-8"
        >
          {t('pricing.noCard')}
        </motion.p>

        {/* TAKENOS TRUST SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col items-center gap-3 bg-[#101010] border border-white/5 rounded-2xl px-8 py-5">
            <div className="flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-400">{t('payment.acceptedCards')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary/80">{t('payment.processor')}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#05070A]">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-white text-center mb-16"
          >
            {t('pricing.faq.title')}
          </motion.h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#101010] border border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-medium pr-4">
                    {t(`pricing.faq.${item.q}`)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-48 pb-5 px-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`pricing.faq.${item.a}`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-medium text-white mb-6"
          >
            {locale === 'en' ? 'Ready to get started?' : '¿Listo para comenzar?'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 mb-8"
          >
            {t('pricing.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-black rounded-full px-8 py-4 font-semibold text-lg transition-transform hover:scale-105"
            >
              {t('pricing.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
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
        </div>
      </footer>
    </div>
  );
}
