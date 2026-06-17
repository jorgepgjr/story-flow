import { getSupabase } from '../_lib/supabase.js';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({});

export default async function handler(req: any, res: any) {
  // Verificação de segurança (Apenas Vercel Cron ou dev local devem rodar isso)
  const authHeader = req.headers.authorization;
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  try {
    // 1. Busca a próxima história da fila
    const { data: queueItems, error: fetchError } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) throw fetchError;

    if (!queueItems || queueItems.length === 0) {
      return res.status(200).json({ success: true, message: 'Queue is empty' });
    }

    const item = queueItems[0];

    // 2. Marca como processando
    const { error: lockError } = await supabase
      .from('generation_queue')
      .update({ status: 'processing' })
      .eq('id', item.id);

    if (lockError) throw lockError;

    // 3. Roda a IA do Gemini
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
      contents: item.prompt,
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

    // 4. Salva no banco de dados como draft
    const scriptId = `s_${Date.now()}`;
    const versionId = `v_init_${Date.now()}`;
    const now = new Date().toISOString();

    const { error: insertScriptError } = await supabase.from('scripts').insert({
      id: scriptId,
      title: storyData.title,
      synopsis: storyData.synopsis,
      status: 'draft',
      created_at: now,
      updated_at: now,
      author_id: item.author_id,
    });
    if (insertScriptError) throw insertScriptError;

    const { error: insertVersionError } = await supabase.from('versions').insert({
      id: versionId,
      script_id: scriptId,
      version_number: '1.0',
      content: storyData.content,
      created_at: now,
      author_id: item.author_id,
    });
    if (insertVersionError) throw insertVersionError;

    // 5. Marca como completado
    await supabase
      .from('generation_queue')
      .update({ status: 'completed' })
      .eq('id', item.id);

    return res.status(200).json({ success: true, message: 'Story processed and saved', scriptId });

  } catch (error: any) {
    console.error('Cron Processing Error:', error);
    return res.status(500).json({ error: 'Failed to process queue', details: error.message });
  }
}
