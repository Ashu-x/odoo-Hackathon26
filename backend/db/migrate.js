import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/db.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migrationDirectory = path.join(directory, 'migrations');

await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
const applied = new Set((await pool.query('SELECT filename FROM schema_migrations')).rows.map(row => row.filename));
const files = (await fs.readdir(migrationDirectory)).filter(file => file.endsWith('.sql')).sort();

for (const filename of files) {
  if (applied.has(filename)) continue;
  const sql = await fs.readFile(path.join(migrationDirectory, filename), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`Applied migration ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

await pool.end();
console.log('Migrations complete');
