export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  popular: boolean;
  cta: string;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Para abogados independientes',
    monthlyPrice: 49,
    yearlyPrice: 39,
    currency: 'USD',
    features: [
      '1 licencia de abogado',
      '200 consultas IA/mes',
      'CRM y gestión de casos',
      'Control de horas y facturación',
      'Analíticas básicas',
    ],
    popular: false,
    cta: 'Comenzar Prueba Gratis',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Para firmas en crecimiento',
    monthlyPrice: 99,
    yearlyPrice: 79,
    currency: 'USD',
    features: [
      '3 licencias de abogado',
      '500 consultas IA/mes',
      'CRM completo + automatización',
      'Analíticas avanzadas y reportes',
      'Puntuación IA de prospectos',
      'Soporte prioritario',
    ],
    popular: true,
    cta: 'Comenzar Prueba Gratis',
  },
  firm: {
    id: 'firm',
    name: 'Firm',
    subtitle: 'Para prácticas establecidas',
    monthlyPrice: 199,
    yearlyPrice: 159,
    currency: 'USD',
    features: [
      '10 licencias de abogado',
      '2,000 consultas IA/mes',
      'Chatbot con marca propia',
      'API e integraciones personalizadas',
      'Analíticas premium + exportación',
      'Gerente de cuenta dedicado',
      'Soporte prioritario 24/7',
    ],
    popular: false,
  cta: 'Comenzar Prueba Gratis',
  },
};

export const PAYMENT_METHODS = {
  primary: {
    name: 'Takenos',
    description: 'Pago internacional en USD',
    acceptedCards: ['Visa', 'Mastercard', 'American Express'],
    processorNote: 'Procesado por MercadoPago',
  },
};
