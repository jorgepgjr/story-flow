import { supabase } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

      const { error } = await supabase
        .from('scripts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error updating status:', error);
      return res.status(500).json({ error: 'Failed to update status', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
