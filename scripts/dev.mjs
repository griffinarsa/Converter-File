import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile?.(resolve(root, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const children = [
  spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '0.0.0.0'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [resolve(root, 'server/index.js')], { cwd: root, stdio: 'inherit' }),
];

let stopping = false;
function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exitCode = code;
}

for (const child of children) {
  child.on('error', error => {
    console.error(`Tidak dapat menjalankan proses development: ${error.message}`);
    stopAll(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping && (code !== 0 || signal)) stopAll(code || 1);
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
