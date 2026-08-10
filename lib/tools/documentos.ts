export interface DocumentoLegal {
  titulo: string;
  contenido: string;
  tipo: string;
}

export function generarPoderSimple(nombreOtorgante: string, rutOtorgante: string, nombreApoderado: string, rutApoderado: string): DocumentoLegal {
  return {
    titulo: 'Poder Simple',
    tipo: 'poder',
    contenido: `
<h3>PODER SIMPLE</h3>
<p>En [Ciudad], a [Fecha], comparece(n): <strong>${nombreOtorgante}</strong>, cédula de identidad N° ${rutOtorgante}, quien otorga PODER SIMPLE a <strong>${nombreApoderado}</strong>, cédula de identidad N° ${rutApoderado}, para que lo represente en todos los actos y contratos necesarios.</p>
    `.trim(),
  };
}
