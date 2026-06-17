import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, count, authorId } = req.body;

  if (!prompt || !count || !authorId) {
    return res.status(400).json({ error: 'Missing prompt, count, or authorId' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  try {
    const queueItems = Array.from({ length: count }).map((_, index) => ({
      prompt: `${prompt}\n\n(Variação ${index + 1} de ${count})`,
      author_id: authorId,
      status: 'pending'
    }));

    const { error } = await supabase.from('generation_queue').insert(queueItems);

    if (error) throw error;

    return res.status(200).json({ success: true, message: `${count} histórias adicionadas à fila.` });
  } catch (error: any) {
    console.error('Error queueing batch:', error);
    return res.status(500).json({ error: 'Failed to queue stories', details: error.message });
  }
}
