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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? "LegalAgent SaaS — Gestión Legal con IA"
      : "LegalAgent SaaS — AI-Powered Legal Practice Management",
    description: isEs
      ? "Plataforma gratuita de gestión para firmas de abogados con CRM, asuntos, tareas y asistencia mediante IA."
      : "Free legal practice platform with CRM, matters, tasks, and AI assistance.",
    keywords: isEs
      ? "software legal, gestión de firmas, chatbot IA abogados, CRM legal, gestión de casos"
      : "legal software, law firm management, AI chatbot for lawyers, legal CRM, case management",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans dark`}>
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
