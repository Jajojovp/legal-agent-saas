import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    provider: 'Takenos',
    website: 'https://takenos.com',
    description: 'Plataforma de pagos internacionales en USD para Latinoamérica. Recibe pagos como si tuvieras una cuenta bancaria en Estados Unidos.',
    supportedCountries: ['Chile', 'Argentina', 'Colombia', 'México', 'Perú', 'Ecuador', 'Uruguay'],
    currencies: ['USD'],
    processor: 'MercadoPago',
    features: [
      'Recibe pagos en USD',
      'Conversión a moneda local',
      'Tarjeta de débito internacional',
      'Sin comisiones ocultas',
    ],
  });
}
