'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Calculator, Calendar, FileText, AlertTriangle, Shield, Gavel, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentAnalyzer } from '@/components/tools/document-analyzer';
import { calcularHonorarios } from '@/lib/tools/honorarios';
import { calcularPlazo } from '@/lib/tools/plazos';
import { generarContrato } from '@/lib/tools/generador-contratos';
import { obtenerPlantillas } from '@/lib/tools/checklist-compliance';

function HonorariosTool() {
  const [tipo, setTipo] = useState<'fijo' | 'por-hora' | 'contingencia'>('fijo');
  const [valor, setValor] = useState('');
  const [horas, setHoras] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);

  const handleCalc = () => {
    const r = calcularHonorarios(tipo, Number(valor) || undefined, Number(horas) || undefined, Number(porcentaje) || undefined);
    setResultado(`$${r.resultado.toLocaleString()} — ${r.detalle}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['fijo', 'por-hora', 'contingencia'] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === t ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
            {t === 'fijo' ? 'Honorario Fijo' : t === 'por-hora' ? 'Por Hora' : 'Contingencia'}
          </button>
        ))}
      </div>
      {tipo === 'fijo' && (
        <div>
          <label className="text-sm text-gray-300 block mb-1">Monto del caso (CLP)</label>
          <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
        </div>
      )}
      {tipo === 'por-hora' && (
        <>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Valor por hora</label>
            <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Horas estimadas</label>
            <input type="number" value={horas} onChange={e => setHoras(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
          </div>
        </>
      )}
      {tipo === 'contingencia' && (
        <>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Monto de la demanda</label>
            <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Porcentaje (%)</label>
            <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
          </div>
        </>
      )}
      <Button onClick={handleCalc} className="bg-primary hover:bg-primary/90 text-black w-full">Calcular</Button>
      {resultado && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-white text-lg font-medium">{resultado}</p>
        </div>
      )}
    </div>
  );
}

function PlazosTool() {
  const [fecha, setFecha] = useState('');
  const [dias, setDias] = useState('');
  const [pais, setPais] = useState<'chile' | 'argentina' | 'mexico' | 'colombia' | 'espana'>('chile');
  const [resultado, setResultado] = useState<string | null>(null);

  const handleCalc = () => {
    if (!fecha || !dias) return;
    const r = calcularPlazo(new Date(fecha), Number(dias), pais);
    setResultado(r.toLocaleDateString());
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-300 block mb-1">Fecha de inicio</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      </div>
      <div>
        <label className="text-sm text-gray-300 block mb-1">Días hábiles</label>
        <input type="number" value={dias} onChange={e => setDias(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      </div>
      <div>
        <label className="text-sm text-gray-300 block mb-1">País</label>
        <select value={pais} onChange={e => setPais(e.target.value as any)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white">
          <option value="chile">Chile</option>
          <option value="argentina">Argentina</option>
          <option value="mexico">México</option>
          <option value="colombia">Colombia</option>
          <option value="espana">España</option>
        </select>
      </div>
      <Button onClick={handleCalc} className="bg-primary hover:bg-primary/90 text-black w-full">Calcular Plazo</Button>
      {resultado && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-white">El plazo vence el: <strong className="text-primary">{resultado}</strong></p>
        </div>
      )}
    </div>
  );
}

function ContratosTool() {
  const [tipo, setTipo] = useState<'prestacion-servicios' | 'arrendamiento' | 'compraventa' | 'confidencialidad'>('prestacion-servicios');
  const [parteA, setParteA] = useState('');
  const [parteB, setParteB] = useState('');
  const [monto, setMonto] = useState('');
  const [contrato, setContrato] = useState<string | null>(null);

  const handleGen = () => {
    const r = generarContrato(tipo, { parteA, parteB, fecha: new Date().toLocaleDateString(), monto: Number(monto) || undefined });
    setContrato(r);
  };

  return (
    <div className="space-y-4">
      <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white">
        <option value="prestacion-servicios">Prestación de Servicios</option>
        <option value="arrendamiento">Arrendamiento</option>
        <option value="compraventa">Compraventa</option>
        <option value="confidencialidad">Confidencialidad</option>
      </select>
      <input type="text" value={parteA} onChange={e => setParteA(e.target.value)} placeholder="Parte A (nombre)" className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <input type="text" value={parteB} onChange={e => setParteB(e.target.value)} placeholder="Parte B (nombre)" className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto (opcional)" className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <Button onClick={handleGen} className="bg-primary hover:bg-primary/90 text-black w-full">Generar Contrato</Button>
      {contrato && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 max-h-96 overflow-y-auto">
          <div className="text-gray-300 text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: contrato }} />
        </div>
      )}
    </div>
  );
}

function RiesgosTool() {
  return <DocumentAnalyzer />;
}

function ComplianceTool() {
  const plantillas: Record<string, any> = obtenerPlantillas() as any;
  const keys = Object.keys(plantillas);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const plantilla: any = keys.length > 0 ? plantillas[keys[selectedIdx]] : null;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const cumplidos = plantilla ? plantilla.items.filter((i: any) => checked[i.id]).length : 0;
  const total = plantilla?.items?.length || 0;

  return (
    <div className="space-y-4">
      <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white">
        {keys.map((k, i) => <option key={k} value={i}>{(plantillas as any)[k].nombre}</option>)}
      </select>
      {plantilla && (
        <>
          <div className="space-y-2">
            {plantilla.items.map((item: any) => (
              <label key={item.id} className="flex items-start gap-3 p-3 bg-[#1A1A1A] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input type="checkbox" checked={!!checked[item.id]} onChange={() => setChecked(prev => ({ ...prev, [item.id]: !prev[item.id] }))} className="mt-0.5 accent-primary" />
                <span className={`text-sm ${checked[item.id] ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{item.pregunta}</span>
              </label>
            ))}
          </div>
          <p className="text-gray-500 text-sm">{cumplidos} de {total} completados</p>
        </>
      )}
    </div>
  );
}

function InteresesTool() {
  const [monto, setMonto] = useState('');
  const [tasa, setTasa] = useState('');
  const [dias, setDias] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const locale = useLocale();

  const handleCalc = () => {
    if (!monto || !tasa || !dias) return;
    const m = parseFloat(monto);
    const t = parseFloat(tasa);
    const d = parseInt(dias);
    const interes = m * (t / 100) * (d / 360);
    const total = m + interes;
    setResultado(
      locale === 'es'
        ? `Interés: $${Math.round(interes * 100) / 100} | Total a pagar: $${Math.round(total * 100) / 100}`
        : `Interest: $${Math.round(interes * 100) / 100} | Total due: $${Math.round(total * 100) / 100}`
    );
  };

  return (
    <div className="space-y-4">
      <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder={locale === 'es' ? 'Monto de la deuda' : 'Debt amount'} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <input type="number" value={tasa} onChange={e => setTasa(e.target.value)} placeholder={locale === 'es' ? 'Tasa de interés anual (%)' : 'Annual interest rate (%)'} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <input type="number" value={dias} onChange={e => setDias(e.target.value)} placeholder={locale === 'es' ? 'Días de mora' : 'Days overdue'} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <button onClick={handleCalc} className="w-full py-2 bg-primary hover:bg-primary/90 text-black font-medium rounded-xl transition-colors">
        {locale === 'es' ? 'Calcular Intereses' : 'Calculate Interest'}
      </button>
      {resultado && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-white">{resultado}</p>
        </div>
      )}
    </div>
  );
}

function IndemnizacionesTool() {
  const [sueldo, setSueldo] = useState('');
  const [anos, setAnos] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const locale = useLocale();

  const handleCalc = () => {
    if (!sueldo || !anos) return;
    const s = parseFloat(sueldo);
    const a = parseFloat(anos);
    const meses = Math.min(11, Math.floor(a));
    const total = s * meses;
    setResultado(
      locale === 'es'
        ? `Indemnización: $${total.toLocaleString()} (${meses} meses de sueldo)`
        : `Severance: $${total.toLocaleString()} (${meses} months of salary)`
    );
  };

  return (
    <div className="space-y-4">
      <input type="number" value={sueldo} onChange={e => setSueldo(e.target.value)} placeholder={locale === 'es' ? 'Sueldo mensual' : 'Monthly salary'} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <input type="number" value={anos} onChange={e => setAnos(e.target.value)} placeholder={locale === 'es' ? 'Años trabajados' : 'Years worked'} className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-white" />
      <button onClick={handleCalc} className="w-full py-2 bg-primary hover:bg-primary/90 text-black font-medium rounded-xl transition-colors">
        {locale === 'es' ? 'Calcular Indemnización' : 'Calculate Severance'}
      </button>
      {resultado && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-white">{resultado}</p>
        </div>
      )}
    </div>
  );
}

function JurisprudenciaTool() {
  return (
    <div className="p-8 text-center">
      <Gavel className="h-12 w-12 mx-auto text-gray-600 mb-4" />
      <p className="text-gray-400">Buscador inteligente de jurisprudencia — próximamente.</p>
    </div>
  );
}

function LegislacionTool() {
  return (
    <div className="p-8 text-center">
      <BookOpen className="h-12 w-12 mx-auto text-gray-600 mb-4" />
      <p className="text-gray-400">Guía interactiva de legislación — próximamente.</p>
    </div>
  );
}

const toolComponents: Record<string, { title: string; icon: any; component: React.FC }> = {
  honorarios: { title: 'Calculadora de Honorarios', icon: Calculator, component: HonorariosTool },
  plazos: { title: 'Calculadora de Plazos Procesales', icon: Calendar, component: PlazosTool },
  contratos: { title: 'Generador de Contratos', icon: FileText, component: ContratosTool },
  riesgos: { title: 'Analizador de Riesgos', icon: AlertTriangle, component: RiesgosTool },
  compliance: { title: 'Checklist Compliance', icon: Shield, component: ComplianceTool },
  intereses: { title: 'Calculadora de Intereses', icon: Calculator, component: InteresesTool },
  jurisprudencia: { title: 'Buscador de Jurisprudencia', icon: Gavel, component: JurisprudenciaTool },
  legislacion: { title: 'Guía de Legislación', icon: BookOpen, component: LegislacionTool },
  indemnizaciones: { title: 'Calculadora de Indemnizaciones', icon: Calculator, component: IndemnizacionesTool },
};

export default function ToolPage() {
  const params = useParams();
  const slug = params.tool as string;
  const locale = useLocale();
  const toolDef = toolComponents[slug];
  const ToolComponent = toolDef?.component;

  if (!ToolComponent) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">{locale === 'es' ? 'Herramienta no encontrada' : 'Tool not found'}</h1>
          <Link href="/tools" className="text-primary hover:text-primary/80">&larr; {locale === 'es' ? 'Volver a herramientas' : 'Back to tools'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Link href="/tools" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> {locale === 'es' ? 'Todas las herramientas' : 'All tools'}
        </Link>

        <div className="bg-[#101010] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <toolDef.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[#DEDBC8] italic">{toolDef.title}</h1>
            </div>
          </div>
          <ToolComponent />
        </div>
      </div>
    </div>
  );
}
