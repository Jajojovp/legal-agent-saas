import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import AuthSessionProvider from '@/components/providers/session-provider';
import "../globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const instrumentSerif = Instrument_Serif({ 
  weight: ['400'],
  style: ['italic'],
  subsets: ["latin"],
  variable: '--font-instrument'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isEs = params.locale === 'es';

  return {
    title: isEs
      ? "LegalAgent SaaS — Gestión Legal con IA"
      : "LegalAgent SaaS — AI-Powered Legal Practice Management",
    description: isEs
      ? "Plataforma completa de gestión para firmas de abogados. Chatbot IA, CRM, gestión de casos, facturación automática y analíticas."
      : "Complete practice management platform for law firms. AI chatbot, CRM, case management, billing automation, and analytics.",
    keywords: isEs
      ? "software legal, gestión de firmas, chatbot IA abogados, CRM legal, gestión de casos, facturación legal"
      : "legal software, law firm management, AI chatbot for lawyers, legal CRM, case management, legal billing",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
