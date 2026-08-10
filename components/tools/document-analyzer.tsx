'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Upload, Loader2, AlertTriangle, CheckCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const locale = useLocale();

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text) formData.append('text', text);
    formData.append('locale', locale);

    try {
      const res = await fetch('/api/ai/analyze-document', { method: 'POST', body: formData });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riesgo: string) => {
    switch (riesgo) {
      case 'alto': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medio': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-400 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
        <FileUp className="h-12 w-12 mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-sm mb-4">
          {locale === 'es' ? 'Sube un documento (PDF, TXT) o pega el texto' : 'Upload a document (PDF, TXT) or paste text'}
        </p>
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium hover:file:bg-primary/20"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={locale === 'es' ? 'O pega el texto del documento aquí...' : 'Or paste the document text here...'}
        className="w-full h-32 px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white resize-none text-sm"
      />

      <Button onClick={handleAnalyze} disabled={loading || (!file && !text)} className="bg-primary hover:bg-primary/90 text-black w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        {locale === 'es' ? 'Analizar Documento' : 'Analyze Document'}
      </Button>

      {analysis && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">{analysis.tipoDocumento}</h3>
            <p className="text-gray-400 text-sm mb-4">{analysis.resumen}</p>

            {analysis.partes?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {locale === 'es' ? 'PARTES INVOLUCRADAS' : 'INVOLVED PARTIES'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.partes.map((p: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-sm text-gray-300">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.clausulas?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {locale === 'es' ? 'CLÁUSULAS' : 'CLAUSES'}
                </p>
                {analysis.clausulas.map((c: any, i: number) => (
                  <div key={i} className="bg-[#101010] border border-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium">{c.titulo}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getRiskColor(c.riesgo)}`}>
                        {c.riesgo.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{c.contenido}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {analysis.riesgosIdentificados?.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
              <h4 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {locale === 'es' ? 'RIESGOS IDENTIFICADOS' : 'IDENTIFIED RISKS'}
              </h4>
              <ul className="space-y-1">
                {analysis.riesgosIdentificados.map((r: string, i: number) => (
                  <li key={i} className="text-red-300 text-sm">• {r}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recomendaciones?.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
              <h4 className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {locale === 'es' ? 'RECOMENDACIONES' : 'RECOMMENDATIONS'}
              </h4>
              <ul className="space-y-1">
                {analysis.recomendaciones.map((r: string, i: number) => (
                  <li key={i} className="text-green-300 text-sm">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
