import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Password with special characters URL-encoded: hm?$w%6WYcPkCJU -> hm%3F%24w%256WYcPkCJU
const connectionString = 'postgresql://postgres:hm%3F%24w%256WYcPkCJU@db.zmbzsutodjaukapopehf.supabase.co:5432/postgres';

const sql = postgres(connectionString, { ssl: 'require' });

async function run() {
  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf8');
    await sql.unsafe(schemaSql);
    console.log('Schema created successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

run();
