const FERIADOS: Record<string, string[]> = {
  chile: [
    '2026-01-01', '2026-04-18', '2026-05-01', '2026-05-21',
    '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18',
    '2026-09-19', '2026-10-12', '2026-10-31', '2026-11-01',
    '2026-12-08', '2026-12-25',
  ],
  argentina: [
    '2026-01-01', '2026-02-16', '2026-03-24', '2026-04-02',
    '2026-05-01', '2026-05-25', '2026-06-20', '2026-07-09',
    '2026-08-17', '2026-10-12', '2026-11-20', '2026-12-08',
    '2026-12-25',
  ],
  mexico: [
    '2026-01-01', '2026-02-05', '2026-03-16', '2026-05-01',
    '2026-09-16', '2026-11-16', '2026-12-25',
  ],
  colombia: [
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-05-01',
    '2026-05-25', '2026-06-15', '2026-07-20', '2026-08-17',
    '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08',
    '2026-12-25',
  ],
  espana: [
    '2026-01-01', '2026-01-06', '2026-04-06', '2026-05-01',
    '2026-08-15', '2026-10-12', '2026-11-01', '2026-12-06',
    '2026-12-08', '2026-12-25',
  ],
};

function formatearFecha(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calcularPlazo(
  fechaInicio: Date,
  diasHabiles: number,
  pais: 'chile' | 'argentina' | 'mexico' | 'colombia' | 'espana'
): Date {
  const feriadosSet = new Set(FERIADOS[pais] || []);
  let fecha = new Date(fechaInicio);
  let diasSumados = 0;

  while (diasSumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay();
    const esFeriado = feriadosSet.has(formatearFecha(fecha));
    if (diaSemana !== 0 && diaSemana !== 6 && !esFeriado) {
      diasSumados++;
    }
  }

  return fecha;
}

export function obtenerFeriados(pais: string): string[] {
  return FERIADOS[pais] || [];
}
