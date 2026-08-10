import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface KnowledgeDoc {
  id: string;
  firmId: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const knowledgeStore: Map<string, KnowledgeDoc[]> = new Map();

export function addDocument(doc: KnowledgeDoc): void {
  const key = `firm-${doc.firmId}`;
  const existing = knowledgeStore.get(key) || [];
  existing.push(doc);
  knowledgeStore.set(key, existing);
}

export function getDocuments(firmId: number): KnowledgeDoc[] {
  return knowledgeStore.get(`firm-${firmId}`) || [];
}

export function searchDocuments(query: string, firmId: number): KnowledgeDoc[] {
  const docs = getDocuments(firmId);
  const q = query.toLowerCase();

  return docs.filter(doc =>
    doc.title.toLowerCase().includes(q) ||
    doc.content.toLowerCase().includes(q) ||
    doc.category.toLowerCase().includes(q)
  );
}

export async function queryWithContext(
  question: string,
  firmId: number,
  locale: string = 'en'
): Promise<string> {
  const relevantDocs = searchDocuments(question, firmId);
  const context = relevantDocs.slice(0, 3).map(d =>
    `[${d.title}] ${d.content.slice(0, 500)}`
  ).join('\n\n');

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = locale === 'es'
    ? `Eres un asistente legal interno de una firma de abogados. Responde la pregunta basándote en el contexto proporcionado y tu conocimiento legal.

Contexto de documentos de la firma:
${context || '(No hay documentos relevantes en la base de conocimiento. Responde con tu conocimiento legal general.)'}

Pregunta: ${question}

Si la respuesta está en los documentos, cítalos. Si no, responde con tu conocimiento legal.`
    : `You are an internal legal assistant for a law firm. Answer the question based on the provided context and your legal knowledge.

Firm documents context:
${context || '(No relevant documents in knowledge base. Answer with your general legal knowledge.)'}

Question: ${question}

If the answer is in the documents, cite them. If not, answer with your legal knowledge.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
