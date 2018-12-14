const IssueTracker = require('./IssueTracker')
const {fetchJson} = require('../utils')

class JiraIssueTracker extends IssueTracker {
    constructor({
        domain,
        projectId,
        account,
        password,
    }) {
        super()

        this.domain = domain
        this.projectId = projectId
        this.account = account
        this.password = password
    }

    name() {
        return 'Jira'
    }

    parseIssueIds(text) {
        return text.match(new RegExp(`${this.projectId}-[0-9]+`, 'g')) || []
    }

    makeIssueUrl(id) {
        return `https://${this.domain}/browse/${id}`
    }

    makeCombinedIssuesUrl(ids) {
        return `https://${this.domain}/issues/?jql=ID%20in%20%28${ids.join('%2C')}%29`
    }

    async fetchIssue(id) {
        let fullJson = null

        try {
            fullJson = await fetchJson({
                hostname: this.domain,
                path: `/rest/api/latest/issue/${id}`,
                auth: `${this.account}:${this.password}`,
            })

            return {
                id,
                name: fullJson['fields']['summary'],
                url: this.makeIssueUrl(id),
                fullJson,
            }
        } catch (e) {
            throw `Error fetching Jira issue (fullJson=${fullJson}, error=${e})`
        }
    }
}

module.exports = JiraIssueTracker
