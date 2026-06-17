import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err: any) {
    return res.status(500).json({ error: 'Supabase init failed', details: err.message });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
