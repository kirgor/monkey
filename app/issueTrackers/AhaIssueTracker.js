const IssueTracker = require('./IssueTracker')
const {parseJiraLikeIds, fetchJson} = require('../utils')

class AhaIssueTracker extends IssueTracker {
    constructor({
        subdomain,
        projectIds,
        account,
        password,
    }) {
        super()

        this.subdomain = subdomain
        this.projectIds = projectIds
        this.account = account
        this.password = password
    }

    name() {
        return 'Aha'
    }

    parseIssueIds(text) {
        return parseJiraLikeIds(this.projectIds, text)
    }

    makeIssueUrl(id) {
        return `https://${this.subdomain}.aha.io/features/${id}`
    }

    makeCombinedIssuesUrl(ids) {
        return null
    }

    async fetchIssue(id) {
        let fullJson = null

        try {
            fullJson = await fetchJson({
                hostname: `${this.subdomain}.aha.io`,
                path: `/api/v1/features/${id}`,
                auth: `${this.account}:${this.password}`,
            })

            return {
                id,
                name: fullJson['feature']['name'],
                url: this.makeIssueUrl(id),
                fullJson,
            }
        } catch (e) {
            throw `Error fetching Aha issue (fullJson=${fullJson}, error=${e})`
        }
    }
}

module.exports = AhaIssueTracker
