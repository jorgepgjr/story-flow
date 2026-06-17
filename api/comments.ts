import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  if (req.method === 'POST') {
    try {
      const { comment } = req.body;
      if (!comment) return res.status(400).json({ error: 'Missing comment data' });

      const { error } = await supabase.from('comments').insert({
        id: comment.id,
        script_id: comment.scriptId,
        user_id: comment.userId,
        text: comment.text,
        created_at: comment.createdAt,
        resolved: comment.resolved,
      });
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Failed to add comment', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
