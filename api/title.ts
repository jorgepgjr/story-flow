import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const { id, title } = req.body;
      if (!id || !title) return res.status(400).json({ error: 'Missing id or title' });

      const { error } = await supabase
        .from('scripts')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error updating title:', error);
      return res.status(500).json({ error: 'Failed to update title', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
