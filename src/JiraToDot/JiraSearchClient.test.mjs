import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { describe, it } from 'node:test';
import { JiraSearchClient } from './JiraSearchClient.mjs';

function response(body, { ok = true } = {}) {
  return {
    ok,
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body);
    },
  };
}

describe('JiraSearchClient', () => {
  it('preserves the Jira v2 search request and passes the JSON response through untouched', async () => {
    const calls = [];
    const jiraResponse = {
      expand: 'schema,names',
      startAt: 0,
      maxResults: 50,
      total: 1,
      issues: [{ id: '10001', key: 'WED-1' }],
    };
    const client = new JiraSearchClient({
      username: 'person@example.com',
      password: 'api-token',
      host: 'example.atlassian.net',
      fetchImpl: async (...args) => {
        calls.push(args);
        return response(jiraResponse);
      },
    });

    const result = await client.searchJira('project = WED', {
      fields: ['*all', 'customfield_11100'],
    });

    assert.deepEqual(result, jiraResponse);
    assert.equal(calls.length, 1);
    const [url, options] = calls[0];
    assert.equal(url, 'https://example.atlassian.net/rest/api/2/search');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(
      options.headers.Authorization,
      `Basic ${Buffer.from('person@example.com:api-token').toString('base64')}`,
    );
    assert.deepEqual(JSON.parse(options.body), {
      jql: 'project = WED',
      fields: ['*all', 'customfield_11100'],
    });
  });

  it('does not invent an Authorization header when credentials are absent', async () => {
    let sentHeaders;
    const client = new JiraSearchClient({
      host: 'example.atlassian.net',
      fetchImpl: async (_url, options) => {
        sentHeaders = options.headers;
        return response({ issues: [] });
      },
    });

    await client.searchJira('project = WED');

    assert.equal('Authorization' in sentHeaders, false);
  });

  it('supports a configurable API version without changing the default', async () => {
    let requestUrl;
    const client = new JiraSearchClient({
      host: 'example.atlassian.net',
      apiVersion: '3',
      fetchImpl: async (url) => {
        requestUrl = url;
        return response({ issues: [] });
      },
    });

    await client.searchJira('project = WED');

    assert.equal(requestUrl, 'https://example.atlassian.net/rest/api/3/search');
  });

  it('turns Jira HTTP errors into errors for the existing outer text-error contract', async () => {
    const client = new JiraSearchClient({
      host: 'example.atlassian.net',
      fetchImpl: async () =>
        response(
          { errorMessages: ['Unauthorized'], errors: {} },
          { ok: false },
        ),
    });

    await assert.rejects(
      client.searchJira('project = WED'),
      /Unauthorized/,
    );
  });
});
