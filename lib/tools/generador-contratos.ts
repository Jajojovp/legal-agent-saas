interface DatosContrato {
  parteA: string;
  parteB: string;
  fecha: string;
  monto?: number;
  duracion?: string;
  descripcion?: string;
}

export function generarContrato(
  tipo: 'prestacion-servicios' | 'arrendamiento' | 'compraventa' | 'confidencialidad',
  datos: DatosContrato
): string {
  const { parteA, parteB, fecha, monto, duracion, descripcion } = datos;

  const clausulas: Record<string, string> = {
    'prestacion-servicios': `
      <h2>CONTRATO DE PRESTACIÓN DE SERVICIOS</h2>
      <p>En ${fecha}, entre <strong>${parteA}</strong> (en adelante "EL PRESTADOR") y <strong>${parteB}</strong> (en adelante "EL CLIENTE"), se acuerda:</p>
      <h3>PRIMERA: Objeto</h3>
      <p>EL PRESTADOR se obliga a prestar los siguientes servicios: ${descripcion || 'los servicios profesionales acordados entre las partes'}.</p>
      ${monto ? `<h3>SEGUNDA: Honorarios</h3><p>EL CLIENTE pagará la cantidad de $${monto.toLocaleString()} por los servicios prestados.</p>` : ''}
      ${duracion ? `<h3>TERCERA: Duración</h3><p>El presente contrato tendrá una duración de ${duracion}.</p>` : ''}
      <h3>${monto || duracion ? 'CUARTA' : 'SEGUNDA'}: Confidencialidad</h3>
      <p>Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada.</p>
    `,
    arrendamiento: `
      <h2>CONTRATO DE ARRENDAMIENTO</h2>
      <p>En ${fecha}, entre <strong>${parteA}</strong> (en adelante "EL ARRENDADOR") y <strong>${parteB}</strong> (en adelante "EL ARRENDATARIO"), se acuerda:</p>
      <h3>PRIMERA: Objeto</h3>
      <p>EL ARRENDADOR da en arrendamiento a EL ARRENDATARIO el bien descrito como: ${descripcion || 'el inmueble ubicado en la dirección acordada entre las partes'}.</p>
      ${monto ? `<h3>SEGUNDA: Renta</h3><p>EL ARRENDATARIO pagará una renta mensual de $${monto.toLocaleString()}.</p>` : ''}
      ${duracion ? `<h3>TERCERA: Plazo</h3><p>El arrendamiento tendrá una duración de ${duracion}.</p>` : ''}
      <h3>${monto || duracion ? 'CUARTA' : 'SEGUNDA'}: Obligaciones</h3>
      <p>EL ARRENDATARIO se obliga a usar el bien de forma adecuada y mantenerlo en buen estado.</p>
    `,
    compraventa: `
      <h2>CONTRATO DE COMPRAVENTA</h2>
      <p>En ${fecha}, entre <strong>${parteA}</strong> (en adelante "EL VENDEDOR") y <strong>${parteB}</strong> (en adelante "EL COMPRADOR"), se acuerda:</p>
      <h3>PRIMERA: Objeto</h3>
      <p>EL VENDEDOR vende a EL COMPRADOR el siguiente bien: ${descripcion || 'el bien mueble/inmueble identificado por las partes'}.</p>
      ${monto ? `<h3>SEGUNDA: Precio</h3><p>EL COMPRADOR pagará la cantidad de $${monto.toLocaleString()} como precio de compra.</p>` : ''}
      <h3>TERCERA: Transferencia</h3>
      <p>EL VENDEDOR transfiere la propiedad del bien libre de gravámenes y obligaciones pendientes.</p>
    `,
    confidencialidad: `
      <h2>ACUERDO DE CONFIDENCIALIDAD (NDA)</h2>
      <p>En ${fecha}, entre <strong>${parteA}</strong> (en adelante "LA PARTE REVELADORA") y <strong>${parteB}</strong> (en adelante "LA PARTE RECEPTORA"), se acuerda:</p>
      <h3>PRIMERA: Información Confidencial</h3>
      <p>Se considera información confidencial toda aquella intercambiada entre las partes relacionada con: ${descripcion || 'los negocios y operaciones de las partes'}.</p>
      ${duracion ? `<h3>SEGUNDA: Vigencia</h3><p>Esta obligación de confidencialidad se mantendrá por un período de ${duracion}.</p>` : '<h3>SEGUNDA: Vigencia</h3><p>Esta obligación de confidencialidad se mantendrá por 2 años desde la firma del presente acuerdo.</p>'}
      <h3>TERCERA: Excepciones</h3>
      <p>No se considerará información confidencial aquella que: (a) sea de dominio público, (b) sea requerida por autoridad competente.</p>
    `,
  };

  return `
    <div style="font-family: serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.8;">
      ${clausulas[tipo]}
      <br/>
      <p style="margin-top: 60px;">_________________________<br/>${parteA}</p>
      <p>_________________________<br/>${parteB}</p>
    </div>
  `.trim();
}
