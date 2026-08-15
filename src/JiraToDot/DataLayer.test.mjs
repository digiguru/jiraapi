import { jest } from '@jest/globals';
import { DataLayer } from './DataLayer.mjs';

const expectedFields = {
  fields: ['*all', 'customfield_11100'],
};

function createDataLayer() {
  const dataLayer = new DataLayer({
    username: 'test@example.com',
    password: 'test-token',
  });
  dataLayer.jira.searchJira = jest.fn().mockResolvedValue({ issues: [] });
  return dataLayer;
}

describe('DataLayer', () => {
  it('builds the current sprint query for a team', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.currentSprintForTeam('Platform');

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      'cf[13100] in (Platform) and Sprint in openSprints() and type in standardIssueTypes()',
      expectedFields,
    );
  });

  it('builds the current sprint query for a project', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.currentSprintForProject('WED');

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      'project in (WED) and Sprint in openSprints() and type in standardIssueTypes()',
      expectedFields,
    );
  });

  it('builds the version query', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.version('Release-1');

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      "'fixVersions' in (Release-1) and type in standardIssueTypes()",
      expectedFields,
    );
  });

  it('builds the sprint query', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.sprint('123');

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      'Sprint in (123) and type in standardIssueTypes()',
      expectedFields,
    );
  });

  it('builds the epic query', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.epic('EPIC-42');

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      'cf[11100] in (EPIC-42) and type in standardIssueTypes()',
      expectedFields,
    );
  });

  it('loads the example through the project query', async () => {
    const dataLayer = createDataLayer();

    await dataLayer.loadExample();

    expect(dataLayer.jira.searchJira).toHaveBeenCalledWith(
      'project in (WED) and Sprint in openSprints() and type in standardIssueTypes()',
      expectedFields,
    );
  });
});
