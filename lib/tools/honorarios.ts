export function calcularHonorarios(
  tipo: 'fijo' | 'por-hora' | 'contingencia',
  valor?: number,
  horas?: number,
  porcentaje?: number
): { resultado: number; detalle: string } {
  switch (tipo) {
    case 'fijo': {
      if (valor === undefined) throw new Error('Valor es requerido para honorarios fijos');
      return {
        resultado: valor,
        detalle: `Honorarios fijos: $${valor.toLocaleString()}`,
      };
    }
    case 'por-hora': {
      if (valor === undefined || horas === undefined) throw new Error('Valor y horas son requeridos para honorarios por hora');
      const total = valor * horas;
      return {
        resultado: total,
        detalle: `${horas} horas × $${valor.toLocaleString()}/hora = $${total.toLocaleString()}`,
      };
    }
    case 'contingencia': {
      if (valor === undefined || porcentaje === undefined) throw new Error('Valor y porcentaje son requeridos para contingencia');
      if (porcentaje < 0 || porcentaje > 100) throw new Error('Porcentaje debe estar entre 0 y 100');
      const honorarios = valor * (porcentaje / 100);
      return {
        resultado: honorarios,
        detalle: `${porcentaje}% de $${valor.toLocaleString()} = $${honorarios.toLocaleString()}`,
      };
    }
    default:
      throw new Error('Tipo de honorario no válido');
  }
}
