/**
 * Build and deploy static export to S3, then invalidate CloudFront cache.
 *
 * Required env vars (or terraform output):
 *   FRONTEND_S3_BUCKET
 *   FRONTEND_CLOUDFRONT_DISTRIBUTION_ID
 *
 * Usage (from Frontend/):
 *   npm run deploy
 */
const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const appDir = join(__dirname, '..');
const outDir = join(appDir, 'out');

function loadEnvFile(filePath) {
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

loadEnvFile(join(appDir, '.env.production'));
loadEnvFile(join(appDir, '.env.local'));

const bucket = process.env.FRONTEND_S3_BUCKET;
const distributionId = process.env.FRONTEND_CLOUDFRONT_DISTRIBUTION_ID;

if (!bucket || !distributionId) {
  console.error(
    'Set FRONTEND_S3_BUCKET and FRONTEND_CLOUDFRONT_DISTRIBUTION_ID.\n' +
      'Get values from: cd Backend/infrastructure/terraform && terraform output',
  );
  process.exit(1);
}

console.log('Building Next.js static export...');
execSync('npm run build', { cwd: join(appDir, '..'), stdio: 'inherit' });

if (!existsSync(outDir)) {
  console.error(`Build output not found at ${outDir}. Ensure next.config.js has output: "export".`);
  process.exit(1);
}

console.log(`Syncing to s3://${bucket}...`);
execSync(`aws s3 sync "${outDir}" "s3://${bucket}" --delete`, { stdio: 'inherit' });

console.log(`Invalidating CloudFront distribution ${distributionId}...`);
execSync(
  `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`,
  { stdio: 'inherit' },
);

console.log('Deploy complete.');
