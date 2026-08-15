import JiraApi from 'jira-client';

export const DEFAULT_JIRA_HOST = 'immediateco.atlassian.net';

export class DataLayer {
  constructor(
    login,
    {
      jiraClient,
      jiraHost = process.env.JIRA_HOST || DEFAULT_JIRA_HOST,
      apiVersion = process.env.JIRA_API_VERSION || '2',
    } = {},
  ) {
    this.jira =
      jiraClient ||
      new JiraApi({
        ...login,
        protocol: 'https',
        host: jiraHost,
        apiVersion,
        strictSSL: true,
      });
  }

  loadExample() {
    return this.currentSprintForProject('WED');
  }

  currentSprintForTeam(team) {
    return this.search(
      `cf[13100] in (${team}) and Sprint in openSprints() and type in standardIssueTypes()`,
    );
  }

  currentSprintForProject(project) {
    return this.search(
      `project in (${project}) and Sprint in openSprints() and type in standardIssueTypes()`,
    );
  }

  version(version) {
    return this.search(
      `'fixVersions' in (${version}) and type in standardIssueTypes()`,
    );
  }

  sprint(sprint) {
    return this.search(
      `Sprint in (${sprint}) and type in standardIssueTypes()`,
    );
  }

  epic(epic) {
    return this.search(
      `cf[11100] in (${epic}) and type in standardIssueTypes()`,
    );
  }

  search(jql) {
    return this.jira.searchJira(jql, {
      fields: ['*all', 'customfield_11100'],
    });
  }
}
