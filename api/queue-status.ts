import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  try {
    const { count, error } = await supabase
      .from('generation_queue')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']);

    if (error) throw error;

    return res.status(200).json({ pendingCount: count || 0 });
  } catch (error: any) {
    console.error('Error fetching queue status:', error);
    return res.status(500).json({ error: 'Failed to fetch queue status', details: error.message });
  }
}
