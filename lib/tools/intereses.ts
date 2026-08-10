export function calcularIntereses(monto: number, tasaAnual: number, dias: number): { interes: number; total: number; detalle: string } {
  const interes = monto * (tasaAnual / 100) * (dias / 360);
  return {
    interes: Math.round(interes * 100) / 100,
    total: monto + Math.round(interes * 100) / 100,
    detalle: `Interés: $${Math.round(interes * 100) / 100} | Total: $${monto + Math.round(interes * 100) / 100}`,
  };
}
