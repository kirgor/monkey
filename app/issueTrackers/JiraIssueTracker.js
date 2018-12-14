const IssueTracker = require('./IssueTracker')
const {parseJiraLikeIds, fetchJson} = require('../utils')

class JiraIssueTracker extends IssueTracker {
    constructor({
        domain,
        projectIds,
        account,
        password,
    }) {
        super()

        this.domain = domain
        this.projectIds = projectIds
        this.account = account
        this.password = password
    }

    name() {
        return 'Jira'
    }

    parseIssueIds(text) {
        return parseJiraLikeIds(this.projectIds, text)
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
