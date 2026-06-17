import { supabase } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { scriptId, version } = req.body;
      if (!scriptId || !version) return res.status(400).json({ error: 'Missing scriptId or version data' });

      const { error } = await supabase.from('versions').insert({
        id: version.id,
        script_id: scriptId,
        version_number: version.versionNumber,
        content: version.content,
        created_at: version.createdAt,
        author_id: version.authorId,
      });
        
      if (error) throw error;
      
      // Update script timestamp
      await supabase
        .from('scripts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', scriptId);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error adding version:', error);
      return res.status(500).json({ error: 'Failed to add version', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
