'use client';

import { 
  LayoutDashboard, Users, FileText, Calendar,
  DollarSign, BarChart3, Settings, MessageSquare,
  Bell, Search, Menu, Globe, LogOut
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/chatbot/chat-widget';
import { useSession, signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'es' : 'en';
  const { data: session } = useSession();

  const navigation = [
    { name: t('dashboard'), href: `/dashboard`, icon: LayoutDashboard },
    { name: t('leads'), href: `/dashboard/leads`, icon: Users },
    { name: t('cases'), href: `/dashboard/cases`, icon: FileText },
    { name: t('tasks'), href: `/dashboard/tasks`, icon: Calendar },
    { name: t('billing'), href: `/dashboard/billing`, icon: DollarSign },
    { name: t('analytics'), href: `/dashboard/analytics`, icon: BarChart3 },
    { name: t('messages'), href: `/dashboard/messages`, icon: MessageSquare },
    { name: t('settings'), href: `/dashboard/settings`, icon: Settings },
  ];
  
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#05070A] font-sans selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0F15] border-r border-white/5 shadow-2xl">
        {/* Logo */}
        <div className="flex h-20 items-center gap-2 px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-md overflow-hidden bg-[#101010] shadow-sm flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
              <img src="/logo.png" alt="LegalAgent Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif italic text-xl text-[#DEDBC8] tracking-tight">
              LegalAgent
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#1A1A1A] text-primary border border-white/5 shadow-sm' 
                    : 'text-gray-400 hover:bg-[#151515] hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher */}
        <div className="px-4 pb-4">
          <Link href={pathname} locale={otherLocale}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-400 hover:bg-[#151515] hover:text-white transition-all border border-transparent hover:border-white/5 text-sm font-medium">
            <Globe className="h-4 w-4 text-gray-500" />
            <span>{locale === 'en' ? 'Español' : 'English'}</span>
          </Link>
        </div>

        {/* User Section */}
        <div className="border-t border-white/5 p-4 mx-2 mb-2 rounded-2xl bg-[#101010]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-primary font-serif italic text-sm">
              {session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-primary/70">{session?.user?.email || ''}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title={t('signOut') || 'Sign Out'}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0B0F15]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex h-20 items-center gap-4 px-8">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-full border border-white/10 bg-[#1A1A1A] py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5 text-gray-400 hover:text-white rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-[#0B0F15]" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-gray-400 hover:text-white rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Chatbot Widget */}
      <ChatWidget 
        firmName="LegalAgent"
        practiceAreas={['Personal Injury', 'Family Law', 'Criminal Defense']}
        mode="internal"
      />
    </div>
  );
}
