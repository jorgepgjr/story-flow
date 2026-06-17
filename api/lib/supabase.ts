import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('As variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não estão configuradas na nuvem.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Para manter compatibilidade com os imports atuais usando um getter seguro
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  }
}) as ReturnType<typeof createClient>;
