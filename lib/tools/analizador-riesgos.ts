export type Riesgo = 'bajo' | 'medio' | 'alto';

export interface FactorRiesgo {
  factor: string;
  nivel: Riesgo;
  recomendacion: string;
}

export interface ResultadoAnalisis {
  puntaje: number;
  nivelGeneral: Riesgo;
  factores: FactorRiesgo[];
  resumen: string;
}

export function analizarRiesgoLegal(data: {
  tipoCaso: 'civil' | 'penal' | 'laboral' | 'comercial' | 'familia';
  montoEnDisputa?: number;
  complejidad: 'baja' | 'media' | 'alta';
  tienePruebas: boolean;
  plazoPrescripcionCercano: boolean;
  jurisdiccionFavorable: boolean;
  partesMultiples: boolean;
}): ResultadoAnalisis {
  const factores: FactorRiesgo[] = [];
  let puntaje = 0;

  factores.push({
    factor: 'Complejidad del caso',
    nivel: data.complejidad === 'alta' ? 'alto' : data.complejidad === 'media' ? 'medio' : 'bajo',
    recomendacion: data.complejidad === 'alta'
      ? 'Se recomienda contratar un perito y preparar estrategia procesal detallada.'
      : 'El caso puede manejarse con los recursos estándar del estudio.',
  });

  if (!data.tienePruebas) {
    puntaje += 25;
    factores.push({
      factor: 'Disponibilidad de pruebas',
      nivel: 'alto',
      recomendacion: 'Urge recopilar y preservar todas las pruebas disponibles antes de que se pierdan.',
    });
  } else {
    factores.push({
      factor: 'Disponibilidad de pruebas',
      nivel: 'bajo',
      recomendacion: 'Las pruebas están aseguradas. Continuar con la estrategia definida.',
    });
  }

  if (data.plazoPrescripcionCercano) {
    puntaje += 30;
    factores.push({
      factor: 'Plazo de prescripción',
      nivel: 'alto',
      recomendacion: 'Iniciar acciones judiciales de inmediato. El plazo de prescripción está próximo a vencer.',
    });
  } else {
    factores.push({
      factor: 'Plazo de prescripción',
      nivel: 'bajo',
      recomendacion: 'El plazo de prescripción no representa una amenaza inmediata.',
    });
  }

  factores.push({
    factor: 'Jurisdicción',
    nivel: data.jurisdiccionFavorable ? 'bajo' : 'medio',
    recomendacion: data.jurisdiccionFavorable
      ? 'La jurisdicción es favorable. Proceder según lo planeado.'
      : 'Evaluar posibilidad de cambio de jurisdicción o buscar acuerdo extrajudicial.',
  });

  if (data.partesMultiples) {
    puntaje += 15;
    factores.push({
      factor: 'Múltiples partes',
      nivel: 'medio',
      recomendacion: 'Coordinar con todas las partes involucradas. Considerar litisconsorcio.',
    });
  } else {
    factores.push({
      factor: 'Múltiples partes',
      nivel: 'bajo',
      recomendacion: 'Sin impacto significativo por número de partes.',
    });
  }

  if (data.montoEnDisputa) {
    if (data.montoEnDisputa > 100000) {
      puntaje += 10;
      factores.push({
        factor: 'Monto en disputa',
        nivel: 'medio',
        recomendacion: 'El monto elevado justifica una estrategia procesal más robusta.',
      });
    } else {
      factores.push({
        factor: 'Monto en disputa',
        nivel: 'bajo',
        recomendacion: 'El monto no representa un riesgo significativo.',
      });
    }
  }

  puntaje = Math.min(puntaje, 100);

  const nivelGeneral: Riesgo = puntaje <= 25 ? 'bajo' : puntaje <= 60 ? 'medio' : 'alto';

  const resumen = nivelGeneral === 'bajo'
    ? 'El caso presenta bajo riesgo legal. Las condiciones son favorables para proceder.'
    : nivelGeneral === 'medio'
    ? 'El caso presenta riesgo moderado. Se recomienda tomar precauciones adicionales.'
    : 'El caso presenta alto riesgo legal. Se recomienda evaluación especializada antes de proceder.';

  return { puntaje, nivelGeneral, factores, resumen };
}
