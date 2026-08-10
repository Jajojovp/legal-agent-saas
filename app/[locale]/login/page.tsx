'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('errors.invalidCredentials'));
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError(t('errors.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] px-4 font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="noise-overlay opacity-30 pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium z-10">
        <ArrowLeft className="w-4 h-4" />
        {t('backToHome')}
      </Link>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#101010] flex items-center justify-center border border-white/10 shadow-xl group-hover:border-primary/50 transition-colors">
              <img src="/logo.png" alt="LegalAgent Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif italic text-2xl text-[#DEDBC8] tracking-tight">
              LegalAgent
            </span>
          </Link>
          <h1 className="text-3xl font-medium text-white mb-2">{t('loginTitle')}</h1>
          <p className="text-gray-400">{t('loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-[#101010]/80 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl">
          
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-xl font-medium text-white transition-all mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t('signInGoogle')}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#101010] text-gray-500">{t('orContinueWith')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-gray-600"
                placeholder="attorney@lawfirm.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">{t('password')}</label>
                <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">{t('forgotPassword')}</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-gray-600"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all mt-4"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('login')}
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
