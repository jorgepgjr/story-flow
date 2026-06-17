import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Google Gen AI SDK
// It will automatically use the GEMINI_API_KEY environment variable if available
const ai = new GoogleGenAI({});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const systemPrompt = `Você é um roteirista profissional de histórias.
    Crie uma história envolvente a partir do prompt do usuário.
    Retorne um JSON com a seguinte estrutura:
    {
      "title": "Um título criativo",
      "synopsis": "Uma sinopse curta e instigante",
      "content": "O texto completo da história."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            synopsis: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['title', 'synopsis', 'content']
        }
      }
    });

    if (!response.text) {
      throw new Error('Failed to generate story content');
    }

    const storyData = JSON.parse(response.text);

    return res.status(200).json(storyData);
  } catch (error: any) {
    console.error('Error generating story:', error);
    return res.status(500).json({ error: 'Failed to generate story', details: error.message });
  }
}
