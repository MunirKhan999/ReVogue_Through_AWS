/**
 * Runs SQL migrations in order against the database configured in Backend/.env
 * Usage: npm run db:migrate (from revogue-backend)
 */
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(join(__dirname, '../../.env'));

const migrationsDir = join(__dirname, '../migrations');

async function run() {
  const useSsl = process.env.DB_SSL === 'true';

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'revogue',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  console.log(
    `Connected to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`  ✓ ${file}`);
  }

  await client.end();
  console.log('All migrations applied.');
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
