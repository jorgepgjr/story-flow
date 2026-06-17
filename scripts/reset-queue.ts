import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
);

async function run() {
  console.log('Resetting stuck items...');
  const { data, error } = await supabase
    .from('generation_queue')
    .update({ status: 'pending' })
    .eq('status', 'processing');
    
  if (error) console.error(error);
  else console.log('Reset successful!');
}

run();
