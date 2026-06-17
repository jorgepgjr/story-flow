import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (client) return client;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`As variáveis de ambiente não foram encontradas pela Vercel. URL length: ${supabaseUrl.length}, Key length: ${supabaseKey.length}`);
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
