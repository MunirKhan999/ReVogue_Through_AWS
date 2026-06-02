/**
 * Build and deploy the NestJS backend to EC2 via SCP + SSH.
 *
 * Required environment variables:
 *   EC2_HOST          - Public IP or DNS (terraform output ec2_public_ip)
 *   EC2_KEY_PATH      - Path to .pem file (if using SSH key)
 *   EC2_USER          - Default: ec2-user
 *
 * Usage (from revogue-backend/):
 *   npm run deploy:ec2
 */
const { execSync } = require('child_process');
const { existsSync, mkdirSync, rmSync, cpSync } = require('fs');
const { join } = require('path');
const os = require('os');

const root = join(__dirname, '..');
const staging = join(root, '.deploy-staging');

const host = process.env.EC2_HOST;
const keyPath = process.env.EC2_KEY_PATH;
const user = process.env.EC2_USER || 'ec2-user';
const remoteDir = '/opt/revogue/revogue-backend';

if (!host) {
  console.error('Set EC2_HOST (terraform output ec2_public_ip)');
  process.exit(1);
}

const sshBase = keyPath
  ? `ssh -i "${keyPath}" -o StrictHostKeyChecking=no ${user}@${host}`
  : `ssh -o StrictHostKeyChecking=no ${user}@${host}`;

const scpBase = keyPath
  ? `scp -i "${keyPath}" -o StrictHostKeyChecking=no -r`
  : 'scp -o StrictHostKeyChecking=no -r';

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function stageFiles() {
  if (existsSync(staging)) rmSync(staging, { recursive: true });
  mkdirSync(staging, { recursive: true });

  run('npm run build', { cwd: root });

  cpSync(join(root, 'dist'), join(staging, 'dist'), { recursive: true });
  cpSync(join(root, 'package.json'), join(staging, 'package.json'));
  cpSync(join(root, 'package-lock.json'), join(staging, 'package-lock.json'));
  cpSync(join(root, 'ecosystem.config.js'), join(staging, 'ecosystem.config.js'));

  const envProd = join(root, '..', '.env.production');
  const envBackend = join(root, '..', '.env');
  if (existsSync(envProd)) {
    cpSync(envProd, join(staging, '.env'));
  } else if (existsSync(envBackend)) {
    console.warn('Warning: using Backend/.env — prefer Backend/.env.production for deploy');
    cpSync(envBackend, join(staging, '.env'));
  } else {
    console.warn('Warning: no .env.production found on server deploy bundle');
  }
}

function deploy() {
  stageFiles();

  const archive = join(os.tmpdir(), `revogue-backend-${Date.now()}.tar.gz`);
  run(`tar -czf "${archive}" -C "${staging}" .`);

  run(`${sshBase} "sudo mkdir -p ${remoteDir} && sudo chown -R ${user}:${user} /opt/revogue"`);

  run(`${scpBase} "${archive}" ${user}@${host}:/tmp/revogue-backend.tar.gz`);

  const remoteScript = [
    `cd ${remoteDir}`,
    'rm -rf dist package.json package-lock.json ecosystem.config.js 2>/dev/null || true',
    'tar -xzf /tmp/revogue-backend.tar.gz -C .',
    'rm /tmp/revogue-backend.tar.gz',
    'npm ci --omit=dev',
    'pm2 delete revogue-api 2>/dev/null || true',
    'pm2 start ecosystem.config.js',
    'pm2 save',
    'pm2 status',
  ].join(' && ');

  run(`${sshBase} "${remoteScript}"`);

  rmSync(staging, { recursive: true });
  try {
    require('fs').unlinkSync(archive);
  } catch {
    /* ignore */
  }

  console.log(`\nDeployed to EC2 (${host}:3001)`);
  console.log(`Public API: use API Gateway URL (terraform output backend_api_url)`);
  console.log(`EC2 Swagger (direct): http://${host}:3001/api/docs`);
}

deploy();
