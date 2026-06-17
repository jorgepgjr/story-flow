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
    const systemPrompt = `Você é um talentoso escritor de histórias e fábulas infantis, especializado em criar roteiros narrativos para podcasts direcionados a crianças.

Sua tarefa é escrever contos educativos, envolventes e com uma moral clara, com base nos temas, personagens ou lições que eu fornecer.

Siga RIGOROSAMENTE as diretrizes abaixo:

1. TEMPO DE DURAÇÃO E TAMANHO: A história deve ser projetada para ser lida em voz alta em um ritmo normal, durando entre 3 a 5 minutos. Para atingir esse tempo, a história deve conter estritamente entre 400 e 750 palavras.
2. ESTILO DE ESCRITA: Use uma linguagem clara, cativante e acessível para crianças. Crie frases com boa musicalidade e ritmo para leitura em voz alta. Inclua diálogos expressivos e descrições sensoriais que ajudem a criança a imaginar a cena enquanto escuta o podcast.
3. CONTEÚDO EDUCATIVO: Toda história deve conter um aprendizado sutil ou uma moral positiva (ex: importância da amizade, respeito à natureza, coragem, honestidade), sem parecer uma bronca ou uma aula monótona.
4. REGRA DE OURO DO FORMATO: Não inclua saudações, introduções, conclusões, notas do autor, ou qualquer texto fora da narrativa. Comece diretamente na primeira palavra do conto e termine na última frase. O título só deve ser incluído no campo 'title'.

Retorne um JSON com a seguinte estrutura:
{
  "title": "Um título criativo",
  "synopsis": "Uma sinopse curta e instigante",
  "content": "O texto da história seguindo exatamente as 4 regras acima."
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
