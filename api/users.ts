import { supabase } from './lib/supabase';

export default async function handler(req: any, res: any) {
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
