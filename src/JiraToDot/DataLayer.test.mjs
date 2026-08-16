import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DataLayer } from './DataLayer.mjs';

const expectedFields = {
  fields: ['*all', 'customfield_11100'],
};

function createDataLayer() {
  const calls = [];
  const jiraClient = {
    async searchJira(...args) {
      calls.push(args);
      return { issues: [] };
    },
  };

  return {
    calls,
    dataLayer: new DataLayer(
      {
        username: 'test@example.com',
        password: 'test-token',
      },
      { jiraClient },
    ),
  };
}

function assertSingleSearch(calls, expectedJql) {
  assert.deepEqual(calls, [[expectedJql, expectedFields]]);
}

describe('DataLayer', () => {
  it('builds the current sprint query for a team', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.currentSprintForTeam('Platform');
    assertSingleSearch(
      calls,
      'cf[13100] in (Platform) and Sprint in openSprints() and type in standardIssueTypes()',
    );
  });

  it('builds the current sprint query for a project', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.currentSprintForProject('WED');
    assertSingleSearch(
      calls,
      'project in (WED) and Sprint in openSprints() and type in standardIssueTypes()',
    );
  });

  it('builds the version query', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.version('Release-1');
    assertSingleSearch(
      calls,
      "'fixVersions' in (Release-1) and type in standardIssueTypes()",
    );
  });

  it('builds the sprint query', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.sprint('123');
    assertSingleSearch(
      calls,
      'Sprint in (123) and type in standardIssueTypes()',
    );
  });

  it('builds the epic query', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.epic('EPIC-42');
    assertSingleSearch(
      calls,
      'cf[11100] in (EPIC-42) and type in standardIssueTypes()',
    );
  });

  it('loads the example through the project query', async () => {
    const { calls, dataLayer } = createDataLayer();
    await dataLayer.loadExample();
    assertSingleSearch(
      calls,
      'project in (WED) and Sprint in openSprints() and type in standardIssueTypes()',
    );
  });
});
