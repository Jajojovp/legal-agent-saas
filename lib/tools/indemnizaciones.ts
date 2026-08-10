export function calcularIndemnizacion(tipo: 'despido-injustificado' | 'anos-servicio' | 'sustitutivo-aviso', sueldoMensual: number, anosTrabajados: number): { monto: number; detalle: string } {
  switch (tipo) {
    case 'despido-injustificado':
      return { monto: sueldoMensual * Math.min(11, anosTrabajados), detalle: `Indemnización por años de servicio: ${Math.min(11, anosTrabajados)} meses` };
    case 'anos-servicio':
      return { monto: sueldoMensual * Math.min(11, anosTrabajados), detalle: `${Math.min(11, anosTrabajados)} meses de sueldo` };
    case 'sustitutivo-aviso':
      return { monto: sueldoMensual, detalle: '1 mes de sueldo en sustitución del aviso previo' };
  }
}
