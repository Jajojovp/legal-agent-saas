import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface DocumentAnalysis {
  tipoDocumento: string;
  partes: string[];
  clausulas: { titulo: string; contenido: string; riesgo: 'bajo' | 'medio' | 'alto' }[];
  resumen: string;
  riesgosIdentificados: string[];
  recomendaciones: string[];
}

export async function analyzeDocument(text: string, locale: string = 'es'): Promise<DocumentAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = locale === 'es'
    ? `Analiza el siguiente documento legal. Identifica:
1. Tipo de documento
2. Partes involucradas
3. Cláusulas principales (con nivel de riesgo: bajo/medio/alto)
4. Resumen ejecutivo
5. Riesgos identificados
6. Recomendaciones

Formato JSON:
{
  "tipoDocumento": "...",
  "partes": ["..."],
  "clausulas": [{"titulo": "...", "contenido": "...", "riesgo": "bajo|medio|alto"}],
  "resumen": "...",
  "riesgosIdentificados": ["..."],
  "recomendaciones": ["..."]

}

Documento:
${text}`
    : `Analyze this legal document. Identify:
1. Document type
2. Involved parties
3. Main clauses (with risk level: low/medium/high)
4. Executive summary
5. Identified risks
6. Recommendations

JSON format:
{
  "tipoDocumento": "...",
  "partes": ["..."],
  "clausulas": [...],
  "resumen": "...",
  "riesgosIdentificados": ["..."],
  "recomendaciones": ["..."]

}

Document:
${text}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  } catch {
    return {
      tipoDocumento: 'No identificado',
      partes: [],
      clausulas: [],
      resumen: response,
      riesgosIdentificados: [],
      recomendaciones: [],
    };
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return await file.text();
  }

  return await file.text();
}
