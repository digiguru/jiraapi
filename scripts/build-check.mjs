import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/index.mjs';

assert.equal(typeof app, 'function', 'Vercel entrypoint must export an Express app');

const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');

try {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
  console.log('API startup and Vercel entrypoint check passed.');
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
