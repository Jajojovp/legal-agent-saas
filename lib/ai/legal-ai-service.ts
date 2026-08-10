import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatbotContext {
  firmName?: string;
  practiceAreas?: string[];
  locale?: string; // 'en' | 'es'
  mode?: 'public' | 'internal';
}

async function getChatResponse(model: any, prompt: string) {
  try {
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw error;
  }
}

async function getAIModel(modelName: string) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  // Explicitly try v1 if v1beta fails, or vice versa
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate chatbot response using Google Gemini
 */
export async function chatbotResponse(
  message: string,
  context?: ChatbotContext
): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is missing from environment variables');
  }

  const locale = context?.locale || 'en';
  const firmName = context?.firmName || 'a law firm';
  const areas = context?.practiceAreas?.join(', ') || 'Personal Injury, Family Law, Criminal Defense, Estate Planning, Business Law';

  const mode = context?.mode || 'public';

  let systemPrompt = '';

  if (mode === 'internal') {
    systemPrompt = locale === 'es'
      ? `Eres el Copiloto Legal Interno de LegalAgent para la firma ${firmName}.
Tu rol es asistir a los abogados de la firma con:
1. Resúmenes de casos y análisis estratégico.
2. Redacción rápida de correos y documentos.
3. Respuestas sobre el uso de la plataforma (ej. cómo crear facturas, calificar prospectos).

Sé extremadamente profesional, directo y orientado a la eficiencia. Tú NO hablas con clientes finales, hablas de abogado a asistente legal.
IMPORTANTE: El usuario es un abogado de tu firma.
Responde SIEMPRE en español.`
      : `You are the Internal Legal Copilot of LegalAgent for ${firmName}.
Your role is to assist the firm's attorneys with:
1. Case summaries and strategic analysis.
2. Quick drafting of emails and documents.
3. Answers about using the platform (e.g., how to create invoices, score leads).

Be extremely professional, direct, and efficiency-oriented. You DO NOT talk to end clients, you talk attorney-to-assistant.
IMPORTANT: The user is an attorney at your firm.
Always respond in English.`;
  } else {
    systemPrompt = locale === 'es'
      ? `Eres un asistente legal virtual amigable para ${firmName}.

Tu rol es:
1. Saludar a los visitantes de forma cálida y profesional
2. Hacer preguntas de calificación para entender sus necesidades legales
3. Determinar en qué área de práctica necesitan ayuda
4. Capturar su información de contacto (nombre, email, teléfono)
5. Preguntar por los detalles del caso legal
6. Agendar consultas cuando sea apropiado

Áreas de práctica que manejamos: ${areas}

Sé empático, profesional y conciso. Haz una pregunta a la vez.
Cuando tengas su información de contacto, confirma que un abogado se comunicará en 24 horas.

IMPORTANTE: Nunca des asesoría legal específica. Siempre recomienda hablar con un abogado.
Responde SIEMPRE en español.`
      : `You are a helpful legal assistant chatbot for ${firmName}.

Your role is to:
1. Greet website visitors warmly and professionally
2. Ask qualifying questions to understand their legal needs
3. Determine which practice area they need help with
4. Capture their contact information (name, email, phone)
5. Ask about their legal case details
6. Schedule consultations when appropriate

Practice areas we handle: ${areas}

Be empathetic, professional, and concise. Ask one question at a time. 
When you have their contact info, confirm you'll have an attorney contact them within 24 hours.

IMPORTANT: Never provide specific legal advice. Always recommend speaking with an attorney.
Always respond in English.`;
  }

  const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting chatbot response with model: ${modelName}`);
      const model = await getAIModel(modelName);
      return await getChatResponse(model, `${systemPrompt}\n\nUser: ${message}`);
    } catch (error: any) {
      console.warn(`Failed with model ${modelName}:`, error.message);
      lastError = error;
      continue;
    }
  }

  console.error('All Gemini models failed:', lastError);
  throw new Error('Failed to generate chatbot response after multiple attempts');
}

/**
 * Qualify and score a lead based on conversation
 */
export async function qualifyLead(
  conversation: { role: string; content: string }[]
): Promise<{
  score: number;
  practiceArea: string | null;
  urgency: 'low' | 'medium' | 'high';
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
}> {
  const conversationText = conversation
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `Analyze this chatbot conversation with a potential legal client and extract:

1. Lead Quality Score (0-100) based on:
   - Clarity of legal issue (30 points)
   - Urgency/timeline (20 points)
   - Budget/willingness to pay (20 points)
   - Contact information provided (30 points)

2. Practice Area (Personal Injury, Family Law, Criminal Defense, Estate Planning, Business Law, Real Estate, Immigration, Employment Law, or null)

3. Urgency Level (low, medium, high)

4. Contact Information (name, email, phone if mentioned)

Conversation:
${conversationText}

Respond ONLY with valid JSON in this exact format:
{
  "score": 85,
  "practiceArea": "Personal Injury",
  "urgency": "high",
  "contactInfo": {
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "+1234567890"
  }
}`;

  try {
    const model = await getAIModel('gemini-1.5-flash');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      practiceArea: parsed.practiceArea || null,
      urgency: parsed.urgency || 'medium',
      contactInfo: parsed.contactInfo || {}
    };
  } catch (error) {
    console.error('Lead qualification error:', error);
    // Return default values on error
    return {
      score: 50,
      practiceArea: null,
      urgency: 'medium',
      contactInfo: {}
    };
  }
}

/**
 * Analyze legal document
 */
export async function analyzeDocument(
  documentText: string,
  analysisType: 'contract' | 'compliance' | 'risk-assessment' = 'contract'
): Promise<{
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
}> {
  const prompts = {
    contract: 'Analyze this contract and identify key terms, obligations, risks, and recommendations.',
    compliance: 'Review this document for compliance issues and regulatory concerns.',
    'risk-assessment': 'Assess legal risks and liabilities in this document.'
  };

  const prompt = `${prompts[analysisType]}

Document:
${documentText.substring(0, 10000)} // Limit to ~10k chars

Provide analysis in JSON format:
{
  "summary": "Brief overview",
  "keyPoints": ["point 1", "point 2"],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["rec 1", "rec 2"]
}`;

  try {
    const model = await getAIModel('gemini-1.5-flash');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Document analysis error:', error);
    return {
      summary: 'Analysis failed. Please try again.',
      keyPoints: [],
      risks: [],
      recommendations: []
    };
  }
}

/**
 * Generate marketing email content
 */
export async function generateMarketingEmail(
  purpose: 'nurture' | 'follow-up' | 'newsletter',
  context: {
    leadName?: string;
    practiceArea?: string;
    firmName?: string;
  }
): Promise<{
  subject: string;
  body: string;
}> {
  const prompts = {
    nurture: `Write a warm, professional email to nurture a potential client who inquired about ${context.practiceArea} services.`,
    'follow-up': `Write a follow-up email checking in with ${context.leadName} regarding their ${context.practiceArea} matter.`,
    newsletter: `Write a monthly newsletter for ${context.firmName} highlighting recent legal updates in ${context.practiceArea}.`
  };

  const prompt = `${prompts[purpose]}

Requirements:
- Professional but approachable tone
- No more than 200 words
- Include clear call-to-action
- Sign off with "The ${context.firmName || 'Legal'} Team"

Provide in JSON format:
{
  "subject": "Email subject line",
  "body": "Email body text"
}`;

  try {
    const model = await getAIModel('gemini-1.5-flash');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Email generation error:', error);
    return {
      subject: 'Follow up from our team',
      body: 'We wanted to reach out regarding your recent inquiry. Please let us know if you have any questions.'
    };
  }
}

/**
 * Generate case strategy recommendations
 */
export async function generateCaseStrategy(
  caseDetails: {
    practiceArea: string;
    description: string;
    jurisdiction: string;
  }
): Promise<{
  strategy: string;
  nextSteps: string[];
  considerations: string[];
}> {
  const prompt = `As a legal strategy advisor, provide strategic recommendations for this case:

Practice Area: ${caseDetails.practiceArea}
Jurisdiction: ${caseDetails.jurisdiction}
Description: ${caseDetails.description}

Provide strategic analysis in JSON format:
{
  "strategy": "Overall strategy recommendation (2-3 sentences)",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "considerations": ["consideration 1", "consideration 2"]
}

IMPORTANT: This is for attorney reference only, not client-facing advice.`;

  try {
    const model = await getAIModel('gemini-1.5-flash');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Case strategy error:', error);
    return {
      strategy: 'Unable to generate strategy. Please consult with senior attorney.',
      nextSteps: [],
      considerations: []
    };
  }
}
