import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['src/server.mjs'], {
  env: {
    ...process.env,
    PORT: '43127',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';
let settled = false;

const finish = (error) => {
  if (settled) {
    return;
  }

  settled = true;
  clearTimeout(timeout);
  child.kill();

  if (error) {
    console.error(error);
    if (stdout) {
      console.error(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
    process.exitCode = 1;
    return;
  }

  console.log('API startup check passed.');
};

child.stdout.on('data', (chunk) => {
  stdout += chunk.toString();
  if (stdout.includes('server is listening on')) {
    finish();
  }
});

child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

child.on('error', (error) => {
  finish(`Could not start API: ${error.message}`);
});

child.on('exit', (code, signal) => {
  if (!settled) {
    finish(`API exited before listening (code ${code}, signal ${signal ?? 'none'}).`);
  }
});

const timeout = setTimeout(() => {
  finish('API did not start listening within 5 seconds.');
}, 5000);
