import assert from 'node:assert/strict';
import { once } from 'node:events';
import { describe, it } from 'node:test';
import { createApp } from './app.mjs';

const operations = [
  ['team', 'currentSprintForTeam'],
  ['project', 'currentSprintForProject'],
  ['version', 'version'],
  ['sprint', 'sprint'],
  ['epic', 'epic'],
];

function createFakeDataLayerFactory(record, { errorOperation } = {}) {
  return (login) => {
    record.logins.push(login);

    return Object.fromEntries(
      operations.map(([, operation]) => [
        operation,
        async (param) => {
          record.calls.push([operation, param]);
          if (operation === errorOperation) {
            throw new Error('boom');
          }
          return { operation, param };
        },
      ]),
    );
  };
}

async function requestApp(
  path,
  {
    method = 'GET',
    headers = {},
    dataLayerFactory,
  } = {},
) {
  const app = createApp({
    dataLayerFactory,
    logger: { log() {} },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
    });
    const body = await response.text();
    return { body, response };
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
}

describe('HTTP contract', () => {
  for (const [route, operation] of operations) {
    it(`preserves GET /${route}/:value`, async () => {
      const record = { calls: [], logins: [] };
      const { body, response } = await requestApp(`/${route}/VALUE`, {
        dataLayerFactory: createFakeDataLayerFactory(record),
      });

      assert.equal(response.status, 200);
      assert.deepEqual(JSON.parse(body), { operation, param: 'VALUE' });
      assert.deepEqual(record.calls, [[operation, 'VALUE']]);
    });
  }

  it('passes the legacy username and password headers to the data layer', async () => {
    const record = { calls: [], logins: [] };
    await requestApp('/project/WED', {
      dataLayerFactory: createFakeDataLayerFactory(record),
      headers: {
        username: 'person@example.com',
        password: 'jira-api-token',
      },
    });

    assert.deepEqual(record.logins, [
      {
        username: 'person@example.com',
        password: 'jira-api-token',
      },
    ]);
  });

  it('keeps accepting the legacy optional third path segment', async () => {
    const record = { calls: [], logins: [] };
    const { body } = await requestApp('/project/WED/ignored', {
      dataLayerFactory: createFakeDataLayerFactory(record),
    });

    assert.deepEqual(JSON.parse(body), {
      operation: 'currentSprintForProject',
      param: 'WED',
    });
  });

  it('keeps accepting a trailing slash', async () => {
    const record = { calls: [], logins: [] };
    const { body } = await requestApp('/project/WED/', {
      dataLayerFactory: createFakeDataLayerFactory(record),
    });

    assert.deepEqual(JSON.parse(body), {
      operation: 'currentSprintForProject',
      param: 'WED',
    });
  });

  it('preserves the original raw URL query-string behaviour', async () => {
    const record = { calls: [], logins: [] };
    const { body } = await requestApp('/project/WED?expand=true', {
      dataLayerFactory: createFakeDataLayerFactory(record),
    });

    assert.deepEqual(JSON.parse(body), {
      operation: 'currentSprintForProject',
      param: 'WED?expand=true',
    });
  });

  it('preserves the invalid-path response', async () => {
    const { body, response } = await requestApp('/project');

    assert.equal(response.status, 200);
    assert.equal(
      body,
      'Must have 2 directories (not 2 in /project) - eg /project/WED',
    );
  });

  it('preserves the unknown-operation response', async () => {
    const { body, response } = await requestApp('/banana/WED');

    assert.equal(response.status, 200);
    assert.equal(
      body,
      'Unusual request. Must be team, project, version, sprint or epic. Instead found banana in /banana/WED',
    );
  });

  it('preserves text errors from Jira calls', async () => {
    const record = { calls: [], logins: [] };
    const { body, response } = await requestApp('/project/WED', {
      dataLayerFactory: createFakeDataLayerFactory(record, {
        errorOperation: 'currentSprintForProject',
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(body, 'Error in call project with WED: Error: boom');
  });

  it('preserves CORS for an existing allowed origin', async () => {
    const record = { calls: [], logins: [] };
    const { response } = await requestApp('/project/WED', {
      dataLayerFactory: createFakeDataLayerFactory(record),
      headers: { origin: 'http://localhost:4000' },
    });

    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'http://localhost:4000',
    );
    assert.equal(response.headers.get('access-control-allow-methods'), 'OPTIONS, GET');
  });

  it('does not allow an unknown CORS origin', async () => {
    const record = { calls: [], logins: [] };
    const { response } = await requestApp('/project/WED', {
      dataLayerFactory: createFakeDataLayerFactory(record),
      headers: { origin: 'https://attacker.example' },
    });

    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });

  it('preserves OPTIONS preflight behaviour', async () => {
    const { body, response } = await requestApp('/project/WED', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:4000' },
    });

    assert.equal(response.status, 200);
    assert.equal(body, '');
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'http://localhost:4000',
    );
  });

  it('provides an additive health endpoint without contacting Jira', async () => {
    const { body, response } = await requestApp('/health');

    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(body), { status: 'ok' });
  });
});
