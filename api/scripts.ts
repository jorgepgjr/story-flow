import { supabase } from './lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select(`
          *,
          versions (*),
          comments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error fetching scripts:', error);
      return res.status(500).json({ error: 'Failed to fetch scripts', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { script } = req.body;
      if (!script) return res.status(400).json({ error: 'Missing script data' });

      // Insert script
      const { error: scriptError } = await supabase.from('scripts').insert({
        id: script.id,
        title: script.title,
        synopsis: script.synopsis,
        status: script.status,
        created_at: script.createdAt,
        updated_at: script.updatedAt,
        author_id: script.authorId,
      });
      if (scriptError) throw scriptError;

      // Insert initial version
      if (script.versions && script.versions.length > 0) {
        const v = script.versions[0];
        const { error: versionError } = await supabase.from('versions').insert({
          id: v.id,
          script_id: script.id,
          version_number: v.versionNumber,
          content: v.content,
          created_at: v.createdAt,
          author_id: v.authorId,
        });
        if (versionError) throw versionError;
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error creating script:', error);
      return res.status(500).json({ error: 'Failed to create script', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: 'Missing script ID' });

      const { error } = await supabase.from('scripts').delete().eq('id', id);
      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error deleting script:', error);
      return res.status(500).json({ error: 'Failed to delete script', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
