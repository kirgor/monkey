const IssueTracker = require('./IssueTracker')
const {fetchJson} = require('../utils')

class AhaIssueTracker extends IssueTracker {
    constructor({
        subdomain,
        projectId,
        account,
        password,
    }) {
        super()

        this.subdomain = subdomain
        this.projectId = projectId
        this.account = account
        this.password = password
    }

    name() {
        return 'Aha'
    }

    parseIssueIds(text) {
        return text.match(new RegExp(`${this.projectId}-[0-9]+`, 'g')) || []
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
