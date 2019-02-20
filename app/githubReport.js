const {spawnSync} = require('child_process')
const {fetchJson} = require('./utils')

async function githubReport({
    localRepoPath,
    fromCommit,
    toCommit,
    fetchBeforeReport,
    githubRepo,
    githubAccount,
    githubPassword,
    issueTrackers,
    criticalChangesRegexps,
}) {
    const {pullRequestIds, nonPullRequests} = parsePullRequests({
        localRepoPath,
        fromCommit,
        toCommit,
        fetchBeforeReport,
    })

    const criticalChanges = parseCriticalChanges({
        localRepoPath,
        fromCommit,
        toCommit,
        criticalChangesRegexps,
    })

    const pullRequests = await Promise.all(pullRequestIds.map(id => fetchPullRequest({
        id,
        githubRepo,
        githubAccount,
        githubPassword,
    })))
    pullRequests.sort((a, b) => a.id - b.id)

    const groupedIssues = await Promise.all(issueTrackers.map(issueTracker => {
        const issueIdsSet = new Set()
        pullRequests.forEach(pr => {
            const ids = [...issueTracker.parseIssueIds(pr.title), ...issueTracker.parseIssueIds(pr.body)]
            ids.forEach(id => issueIdsSet.add(id))
            pr.hasIssues |= ids.length > 0
        })
        nonPullRequests.forEach(npr => {
            issueTracker.parseIssueIds(npr).forEach(id => issueIdsSet.add(id))
        })

        const issueIds = [...issueIdsSet]
        const fetchPromises = []
        issueIdsSet.forEach(id => fetchPromises.push(issueTracker.fetchIssue(id)))

        return Promise.all(issueIds.map(id => issueTracker.fetchIssue(id)))
            .then(issues => ({
                issueTrackerName: issueTracker.name(),
                combinedUrl: issueTracker.makeCombinedIssuesUrl(issueIds),
                issues: issues.sort((a, b) => a.id - b.id),
            }))
    }))

    return {
        pullRequests,
        nonPullRequests,
        groupedIssues,
        criticalChanges,
    }
}

function parsePullRequests({
    localRepoPath,
    fromCommit,
    toCommit,
    fetchBeforeReport,
}) {
    if (fetchBeforeReport) {
        spawnSync('git fetch --tags', {
            shell: true,
            cwd: localRepoPath,
        })
    }

    const gitLogProcess = spawnSync(`git log ${fromCommit}..${toCommit} --oneline --first-parent`, {
        shell: true,
        cwd: localRepoPath,
    })

    const regexp = /Merge pull request \#([0-9]+).*/
    const pullRequestIds = []
    const nonPullRequests = []
    gitLogProcess.stdout.toString().split('\n').forEach(line => {
        const match = regexp.exec(line)
        if (match) {
            pullRequestIds.push(parseInt(match[1]))
        } else if (line) {
            nonPullRequests.push(line)
        }
    })

    return {
        pullRequestIds,
        nonPullRequests,
    }
}

function parseCriticalChanges({
    localRepoPath,
    fromCommit,
    toCommit,
    criticalChangesRegexps,
}) {
    const gitDiffProcess = spawnSync(`git diff ${fromCommit}..${toCommit} --name-only`, {
        shell: true,
        cwd: localRepoPath,
    })

    const criticalChanges = new Set()
    gitDiffProcess.stdout.toString().split('\n').forEach(line => {
        for (let regexp of criticalChangesRegexps) {
            if (line.match(regexp)) {
                criticalChanges.add(line)
                break
            }
        }
    })

    return [...criticalChanges]
}

async function fetchPullRequest({
    id,
    githubRepo,
    githubAccount,
    githubPassword,
}) {
    const fullJson = await fetchJson({
        hostname: 'api.github.com',
        path: `/repos/${githubRepo}/pulls/${id}`,
        auth: `${githubAccount}:${githubPassword}`,
    })

    return {
        id,
        title: fullJson['title'] || '',
        body: fullJson['body'] || '',
        url: `https://github.com/${githubRepo}/pull/${id}`,
        hasIssues: false,
        fullJson,
    }
}

module.exports = githubReport
