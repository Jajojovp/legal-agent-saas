'use client';

import { useState } from 'react';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
  planTier: string;
  planInterval: string;
  children: React.ReactNode;
  className?: string;
  currency?: string;
}

export function CheckoutButton({ planTier, planInterval, children, className, currency = 'USD' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/mp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier, planInterval, currency }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al procesar el pago');
      }
    } catch {
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className={className || 'w-full bg-primary hover:bg-primary/90 text-black font-semibold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all'}
      >
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
        {children}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        <span>Pago seguro procesado por Takenos y MercadoPago</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <CreditCard className="h-4 w-4 text-gray-600" />
        <span className="text-xs text-gray-600">Visa, Mastercard, AMEX aceptadas</span>
      </div>
    </div>
  );
}
