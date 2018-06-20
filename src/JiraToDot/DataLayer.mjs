import JiraApi from 'jira-client';
export class DataLayer {
    
    constructor(login) {
        console.log(login.username);
        this.jira = new JiraApi({
            ...login,
            protocol: 'https',
            host: "immediateco.atlassian.net",
            apiVersion: '2',
            strictSSL: true
        });
        console.log(`Logged in`);
        
    }


    async loadExample () {
        return currentProject("WED");
        //return this.jira.findIssue("WED-5318");
        /*
            .then(issue => {
                console.log(`Status: ${issue.fields.status.name}`);
            })
            .catch(err => {
                console.error(err);
            });
            this.setState({graph: toDotMultiple(parseMultipleBlockers(example))});
        */
    }
    async currentSprintForTeam (team) {
        return await this.search(`cf[13100] in (${team}) and Sprint in openSprints() and type in standardIssueTypes()`);
    }
    async currentSprintForProject (project) {
        console.log(`project ${project} - load it.`);
        return await this.search(`project in (${project}) and Sprint in openSprints() and type in standardIssueTypes()`);
    }
    async version (version) {
        return await this.search(`'fixVersions' in (${version}) and type in standardIssueTypes()`);
    }
    async sprint (sprint) {
        return await this.search(`Sprint in (${sprint}) and type in standardIssueTypes()`);
    }
    async epic (epic) {
        return await this.search(`cf[11100] in (${epic}) and type in standardIssueTypes()`);
    }
    async search(jql) {
        console.log(jql);
        return await this.jira.searchJira(jql);
    }
}
