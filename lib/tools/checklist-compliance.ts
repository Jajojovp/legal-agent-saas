export interface ItemChecklist {
  id: string;
  categoria: string;
  pregunta: string;
  cumplimiento: boolean | null;
  observacion?: string;
}

export interface PlantillaCompliance {
  nombre: string;
  descripcion: string;
  items: Omit<ItemChecklist, 'cumplimiento' | 'observacion'>[];
}

const PLANTILLAS: Record<string, PlantillaCompliance> = {
  'proteccion-datos': {
    nombre: 'Protección de Datos (GDPR/Ley 19.628)',
    descripcion: 'Checklist de cumplimiento normativo en protección de datos personales.',
    items: [
      { id: 'dp-1', categoria: 'Registro', pregunta: '¿Existe un registro de actividades de tratamiento?' },
      { id: 'dp-2', categoria: 'Registro', pregunta: '¿Se ha designado un Delegado de Protección de Datos (DPO)?' },
      { id: 'dp-3', categoria: 'Consentimiento', pregunta: '¿Se obtiene consentimiento explícito para el tratamiento de datos?' },
      { id: 'dp-4', categoria: 'Consentimiento', pregunta: '¿Las políticas de privacidad están actualizadas y accesibles?' },
      { id: 'dp-5', categoria: 'Seguridad', pregunta: '¿Se implementan medidas de seguridad técnicas y organizativas adecuadas?' },
      { id: 'dp-6', categoria: 'Seguridad', pregunta: '¿Existe un protocolo de notificación de violaciones de datos?' },
      { id: 'dp-7', categoria: 'Derechos', pregunta: '¿Se cuenta con procedimientos para atender solicitudes de acceso, rectificación y supresión?' },
      { id: 'dp-8', categoria: 'Transferencias', pregunta: '¿Las transferencias internacionales de datos cuentan con garantías adecuadas?' },
    ],
  },
  'lavado-activos': {
    nombre: 'Prevención de Lavado de Activos',
    descripcion: 'Checklist de cumplimiento en prevención de lavado de activos y financiamiento del terrorismo.',
    items: [
      { id: 'la-1', categoria: 'Debida Diligencia', pregunta: '¿Se realiza identificación y verificación de la identidad del cliente?' },
      { id: 'la-2', categoria: 'Debida Diligencia', pregunta: '¿Se mantienen registros actualizados de beneficiarios finales?' },
      { id: 'la-3', categoria: 'Monitoreo', pregunta: '¿Existe un sistema de monitoreo de transacciones sospechosas?' },
      { id: 'la-4', categoria: 'Monitoreo', pregunta: '¿Se realiza un análisis de perfil de riesgo del cliente?' },
      { id: 'la-5', categoria: 'Reportes', pregunta: '¿Se reportan operaciones sospechosas a la unidad de inteligencia financiera?' },
      { id: 'la-6', categoria: 'Capacitación', pregunta: '¿El personal recibe capacitación periódica en prevención de lavado de activos?' },
      { id: 'la-7', categoria: 'Políticas', pregunta: '¿Existe un manual de políticas y procedimientos actualizado?' },
    ],
  },
  'etica-profesional': {
    nombre: 'Ética Profesional y Compliance',
    descripcion: 'Checklist de cumplimiento de estándares éticos y regulatorios para firmas legales.',
    items: [
      { id: 'ep-1', categoria: 'Confidencialidad', pregunta: '¿Se protege adecuadamente el secreto profesional y la confidencialidad?' },
      { id: 'ep-2', categoria: 'Confidencialidad', pregunta: '¿Los sistemas de comunicación con clientes son seguros?' },
      { id: 'ep-3', categoria: 'Conflictos', pregunta: '¿Existe un sistema de detección y gestión de conflictos de interés?' },
      { id: 'ep-4', categoria: 'Conflictos', pregunta: '¿Se informa a los clientes sobre posibles conflictos de interés?' },
      { id: 'ep-5', categoria: 'Honorarios', pregunta: '¿Los honorarios se comunican de forma clara y por escrito?' },
      { id: 'ep-6', categoria: 'Publicidad', pregunta: '¿La publicidad y el marketing cumplen con las normas del colegio de abogados?' },
      { id: 'ep-7', categoria: 'Formación', pregunta: '¿Se cumple con los requisitos de formación continua obligatoria?' },
    ],
  },
};

export function obtenerPlantillas(): PlantillaCompliance[] {
  return Object.values(PLANTILLAS);
}

export function obtenerPlantilla(id: string): PlantillaCompliance | undefined {
  return PLANTILLAS[id];
}

export function calcularCumplimiento(items: ItemChecklist[]): { cumplidos: number; total: number; porcentaje: number } {
  const evaluados = items.filter(i => i.cumplimiento !== null);
  const cumplidos = evaluados.filter(i => i.cumplimiento).length;
  const total = evaluados.length;
  return {
    cumplidos,
    total,
    porcentaje: total > 0 ? Math.round((cumplidos / total) * 100) : 0,
  };
}
